
import akshare as ak
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

plt.rcParams['font.sans-serif'] = ['SimHei', 'WenQuanYi Micro Hei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

def get_stock_data(stock_code, period=365):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=period)
    start_date_str = start_date.strftime('%Y%m%d')
    end_date_str = end_date.strftime('%Y%m%d')
    
    print(f"正在获取 {stock_code} 从 {start_date_str} 到 {end_date_str} 的数据...")
    df = ak.stock_zh_a_hist(symbol=stock_code, period="daily", start_date=start_date_str, end_date=end_date_str, adjust="qfq")
    df = df.rename(columns={
        '日期': 'date',
        '开盘': 'open',
        '收盘': 'close',
        '最高': 'high',
        '最低': 'low',
        '成交量': 'volume',
        '成交额': 'amount',
        '振幅': 'amplitude',
        '涨跌幅': 'pct_chg',
        '涨跌额': 'change',
        '换手率': 'turnover'
    })
    df = df.sort_values('date').reset_index(drop=True)
    print(f"成功获取 {len(df)} 条数据")
    return df

def calculate_indicators(df):
    df['MA5'] = df['close'].rolling(5).mean()
    df['MA10'] = df['close'].rolling(10).mean()
    df['MA20'] = df['close'].rolling(20).mean()
    df['MA60'] = df['close'].rolling(60).mean()
    
    df['EMA12'] = df['close'].ewm(span=12, adjust=False).mean()
    df['EMA26'] = df['close'].ewm(span=26, adjust=False).mean()
    df['DIF'] = df['EMA12'] - df['EMA26']
    df['DEA'] = df['DIF'].ewm(span=9, adjust=False).mean()
    df['MACD'] = 2 * (df['DIF'] - df['DEA'])
    
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    df['upper'] = df['close'].rolling(20).mean() + 2 * df['close'].rolling(20).std()
    df['middle'] = df['close'].rolling(20).mean()
    df['lower'] = df['close'].rolling(20).mean() - 2 * df['close'].rolling(20).std()
    
    return df

def generate_signals(df):
    df['signal'] = 0
    
    df.loc[(df['MA5'] > df['MA20']) & (df['MA5'].shift(1) <= df['MA20'].shift(1)), 'signal'] = 1
    df.loc[(df['MA5'] < df['MA20']) & (df['MA5'].shift(1) >= df['MA20'].shift(1)), 'signal'] = -1
    
    df.loc[(df['DIF'] > df['DEA']) & (df['DIF'].shift(1) <= df['DEA'].shift(1)) & (df['MACD'] > 0), 'signal'] = 1
    df.loc[(df['DIF'] < df['DEA']) & (df['DIF'].shift(1) >= df['DEA'].shift(1)) & (df['MACD'] < 0), 'signal'] = -1
    
    df.loc[(df['RSI'] < 30) & (df['RSI'].shift(1) >= 30), 'signal'] = 1
    df.loc[(df['RSI'] > 70) & (df['RSI'].shift(1) <= 70), 'signal'] = -1
    
    return df

def backtest(df, initial_capital=200000, commission_rate=0.0003, min_commission=5):
    capital = initial_capital
    position = 0
    portfolio_values = []
    trades = []
    
    for idx, row in df.iterrows():
        current_price = row['close']
        
        if position == 0 and row['signal'] == 1:
            max_shares = int(capital / (current_price * (1 + commission_rate)))
            max_shares = max_shares // 100 * 100
            if max_shares >= 100:
                cost = max_shares * current_price
                commission = max(cost * commission_rate, min_commission)
                total_cost = cost + commission
                if total_cost <= capital:
                    position = max_shares
                    capital -= total_cost
                    trades.append({
                        'date': row['date'],
                        'type': '买入',
                        'price': current_price,
                        'shares': max_shares,
                        'amount': total_cost
                    })
                    print(f"{row['date']} 买入 {max_shares} 股，价格 {current_price:.2f}，花费 {total_cost:.2f}")
        
        elif position > 0 and row['signal'] == -1:
            revenue = position * current_price
            commission = max(revenue * commission_rate, min_commission)
            net_revenue = revenue - commission
            capital += net_revenue
            trades.append({
                'date': row['date'],
                'type': '卖出',
                'price': current_price,
                'shares': position,
                'amount': net_revenue
            })
            print(f"{row['date']} 卖出 {position} 股，价格 {current_price:.2f}，收入 {net_revenue:.2f}")
            position = 0
        
        portfolio_value = capital + position * current_price
        portfolio_values.append(portfolio_value)
    
    df['portfolio_value'] = portfolio_values
    
    final_value = portfolio_values[-1]
    total_return = (final_value - initial_capital) / initial_capital * 100
    
    portfolio_array = np.array(portfolio_values)
    running_max = np.maximum.accumulate(portfolio_array)
    drawdown = (portfolio_array - running_max) / running_max * 100
    max_drawdown = drawdown.min()
    
    df['drawdown'] = drawdown
    
    return df, trades, {
        'initial_capital': initial_capital,
        'final_value': final_value,
        'total_return': total_return,
        'max_drawdown': max_drawdown,
        'trades_count': len(trades)
    }

def plot_results(df, metrics):
    fig, axes = plt.subplots(3, 1, figsize=(14, 15))
    
    axes[0].plot(df['date'], df['close'], label='股票价格', color='blue', alpha=0.7)
    axes[0].plot(df['date'], df['MA5'], label='MA5', color='orange', alpha=0.7)
    axes[0].plot(df['date'], df['MA20'], label='MA20', color='green', alpha=0.7)
    
    buy_signals = df[df['signal'] == 1]
    sell_signals = df[df['signal'] == -1]
    axes[0].scatter(buy_signals['date'], buy_signals['close'], color='red', marker='^', s=100, label='买入信号')
    axes[0].scatter(sell_signals['date'], sell_signals['close'], color='purple', marker='v', s=100, label='卖出信号')
    
    axes[0].set_title('股票价格与买卖信号', fontsize=14)
    axes[0].legend()
    axes[0].grid(True)
    
    axes[1].plot(df['date'], df['portfolio_value'], label='组合价值', color='red', linewidth=2)
    axes[1].axhline(y=metrics['initial_capital'], color='blue', linestyle='--', label='初始本金')
    
    axes[1].set_title(f'组合净值曲线 (总收益: {metrics["total_return"]:.2f}%)', fontsize=14)
    axes[1].legend()
    axes[1].grid(True)
    
    axes[2].plot(df['date'], df['drawdown'], label='回撤', color='orange', linewidth=2)
    axes[2].fill_between(df['date'], df['drawdown'], 0, alpha=0.3, color='orange')
    
    axes[2].set_title(f'回撤曲线 (最大回撤: {metrics["max_drawdown"]:.2f}%)', fontsize=14)
    axes[2].legend()
    axes[2].grid(True)
    
    plt.tight_layout()
    plt.savefig('/workspace/backtest_result.png', dpi=300, bbox_inches='tight')
    print("图表已保存为 backtest_result.png")
    plt.show()

def main():
    stock_code = "603887"
    
    df = get_stock_data(stock_code)
    
    df = calculate_indicators(df)
    
    df = generate_signals(df)
    
    df, trades, metrics = backtest(df)
    
    print("\n" + "="*50)
    print("回测结果")
    print("="*50)
    print(f"初始本金: {metrics['initial_capital']:.2f} 元")
    print(f"最终价值: {metrics['final_value']:.2f} 元")
    print(f"总收益率: {metrics['total_return']:.2f}%")
    print(f"最大回撤: {metrics['max_drawdown']:.2f}%")
    print(f"交易次数: {metrics['trades_count']}")
    print("="*50 + "\n")
    
    print("交易记录:")
    for trade in trades:
        print(f"{trade['date']} {trade['type']} {trade['shares']}股 @ {trade['price']:.2f}元，金额: {trade['amount']:.2f}元")
    
    plot_results(df, metrics)

if __name__ == "__main__":
    main()

