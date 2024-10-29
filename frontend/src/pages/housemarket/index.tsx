import { Button, Input, Image } from 'antd';
import {pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9, pic10} from "../../asset";
import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import { web3, HouseMarketContract} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'HouseMarketChain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const HouseMarketPage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [playAmount, setPlayAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [playerNumber, setPlayerNumber] = useState(0)
    const [managerAccount, setManagerAccount] = useState('')

    const [tokenId, setTokenId] = useState<number>(1); // tokenId输入框的状态变量
    const [price, setPrice] = useState<number>(1); // price输入框的状态变量
    const [houseInfo, setHouseInfo] = useState<{ owner: string; price: number; listedTimestamp: number } | null>(null);
    const [isOwner, setIsOwner] = useState(true);
    const [nextTokenId, setNextTokenId] = useState<number>(1);
    const pic_list = [pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9, pic10]

    
    const onTokenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTokenId(parseInt(e.target.value) || 0); // 将输入值转换为整数
        console.log("onTokenIdChange: TokenId =", tokenId)
    };
    
    const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(parseFloat(e.target.value) || 0); // 将输入值转换为浮点数
    };

    // 铸造房屋的函数，仅合约拥有者可以调用
    const mintHouse = async () => {
        if (!HouseMarketContract || !account || !isOwner) {
            console.log("HouseMarketContract", HouseMarketContract)
            console.log("account", account)
            console.log("isOwner", isOwner)
            alert("{只有发起合约的房东才能建造房屋");
            return;
        }

        try {
            await HouseMarketContract.methods.mintHouse(account).send({ from: account });
            alert('成功新建房屋！');
            const nextId = await HouseMarketContract.methods.getNextTokenId().call();
            console.log(`Next Token ID: ${nextId}`);
            setNextTokenId(nextId); // 更新状态
        } catch (error: any) {
            console.error(error);
            alert("只有发起合约的房东才能建造房屋");
        }
    };

    // 列出房屋的函数
    const listHouse = async () => {
        if (!HouseMarketContract || !account) return;

        try {
            await HouseMarketContract.methods.listHouse(tokenId, web3.utils.toWei(price.toString(), 'ether')).send({ from: account });
            alert('成功挂出房屋出售信息');
        } catch (error: any) {
            console.error(error);
            alert('该房屋并不属于您，无法挂出出售信息');
        }
    };

    // 购买房屋的函数
    const buyHouse = async () => {
        if (!HouseMarketContract || !account) return;

        try {
            const house = await HouseMarketContract.methods.houses(tokenId).call();
            console.log('house', house)
            const priceInWei = house.price;
            await HouseMarketContract.methods.buyHouse(tokenId).send({
                from: account,
                value: priceInWei,
            });
            alert('成功购买新房屋!');
        } catch (error: any) {
            console.error(error);
            alert('Failed to buy house: ${error.message}');
        }
    };
    const getHouseInfo = async () => {
        if (!HouseMarketContract) return; // 检查合约实例是否存在
    
        console.log("Fetching info for tokenId:", tokenId); // 调试信息
    
        try {
            console.log("await HouseMarketContract.methods.getHouseInfo(tokenId).call();", await HouseMarketContract.methods.getHouseInfo(tokenId).call())
            const house = await HouseMarketContract.methods.getHouseInfo(tokenId).call();
            console.log("Fetched house info:", house); // 调试信息
    
            // 更新状态
            setHouseInfo({
                owner: house[0],
                price: parseInt(web3.utils.fromWei(house[1], 'ether')),
                listedTimestamp: parseInt(house[2]),
            });
        } catch (error: any) {
            console.error(error);
            alert(`Failed to get house info: ${error.message}`);
        }
    };


    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])


    const initCheckAccounts = async () => {
        // @ts-ignore
        const {ethereum} = window;
        if (Boolean(ethereum && ethereum.isMetaMask)) {
            // 尝试获取连接的用户账户
            const accounts = await web3.eth.getAccounts()
            if(accounts && accounts.length) {
                setAccount(accounts[0])
            }
        }
        const nextId = await HouseMarketContract.methods.getNextTokenId().call();
            console.log(`Next Token ID: ${nextId}`);
            setNextTokenId(nextId); // 更新状态
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <div className='container'>
            <div className='main'>
                <h1>浙江大学房屋交易系统</h1>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <p>当前用户：{account === '' ? '无用户连接' : account}</p>
                    <Button onClick={initCheckAccounts}>刷新账户信息</Button>
                    {nextTokenId !== null ? (
                        <p>当前的共有: {nextTokenId-1} 套房屋</p>
                    ) : (
                        <p>正在加载 Token ID...</p>
                    )}
            
                </div>
                <div className='container'>
                {isOwner && (
                <div style={{ marginTop: '20px' }}>
                    <p>房东建造新房屋</p>
                    <Button onClick={mintHouse}>建造</Button>
                </div>
            )}
                <h2>购买房屋</h2>
                    <p>意向购买的房屋ID</p>
                    <Input
                        placeholder="输入房屋的 Token ID"
                        value={tokenId}
                        onChange={onTokenIdChange}
                        style={{ marginBottom: 10 }}
                    />
                    <p>意向房屋价格期望</p>
                    <Input
                        placeholder="输入房屋价格 (ETH)"
                        value={price}
                        onChange={onPriceChange}
                        style={{ marginBottom: 20 }}
                    />
                    <Button type="primary" onClick={buyHouse}>
                        购买房屋
                    </Button>
                </div>
                <div style={{ marginTop: '20px' }}>
                <h2>闲置房屋挂单</h2>
                <Input
                    placeholder="Token ID"
                    type="number"
                    onChange={(e) => setTokenId(parseInt(e.target.value))}
                />
                <Input
                    placeholder="Price (ETH)"
                    type="number"
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                />
                <Button onClick={listHouse}>挂单</Button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>查询在售二手房屋信息</h2>
                <Input
                    placeholder="Token ID"
                    type="number"
                    value={tokenId}
                    onChange={onTokenIdChange}
                />
                <Button onClick={getHouseInfo}>Get Info</Button>
                {houseInfo && (
                    <div>
                        <Image
                            height='160px'
                            preview={false}
                            src={pic_list[tokenId]}
                        />
                        <p>房主: {houseInfo.owner}</p>
                        {houseInfo.price === 0 ? (
                            <p>该房屋暂未挂单出售</p>
                        ) : (
                            <p>价格: {houseInfo.price} ETH</p>
                        )}
                        {houseInfo.price === 0 ? (
                            <p>请联系房主，询问是否有意出售</p>
                        ) : (
                            <p>Listed Timestamp: {new Date(houseInfo.listedTimestamp * 1000).toLocaleString()}</p>
                        )}
                        
                    </div>
                )}
            </div>
                
            </div>
        </div>
    )
}

export default HouseMarketPage