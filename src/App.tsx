/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { CHAIN_NAMESPACES, IProvider, UX_MODE, WEB3AUTH_NETWORK, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { Box, Button, Card, CardContent, CircularProgress, Typography, Avatar, } from '@mui/material';
import config from '../config';

const App: React.FC = () => {
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Web3Auth設定
  const { clientId, infuraApiKey } = config.web3auth;

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          privateKeyProvider: new EthereumPrivateKeyProvider({
            config: {
              chainConfig: {
                chainNamespace: CHAIN_NAMESPACES.EIP155,
                chainId: "0x89", // hex of 137, polygon mainnet
                rpcTarget: "https://rpc.ankr.com/polygon",
//                chainId: "0x534e5f41", // Amoy Testnet
//                rpcTarget: `https://polygon-amoy.infura.io/v3/${infuraApiKey}`,
              }
            }
          }),
          uiConfig: {
            appName: "Web3Auth Demo",
            mode: "light", // "light", "dark", "auto"
            logoLight: "https://web3auth.io/images/web3authlog.png",
            logoDark: "https://web3auth.io/images/web3authlogodark.png",
            defaultLanguage: "ja", // en, de, ja, ko, zh, es, fr, pt, nl
            loginGridCol: 3, // 2 | 3
            primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
//            loginMethodsOrder: ["apple", "google", "line", "twitter", "facebook", "github", "discord", "email_passwordless" ],
            uxMode: UX_MODE.REDIRECT,
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        });

        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.AUTH]: {
              label: "openlogin",
              loginMethods: {
                reddit: {
                  name: "reddit",
                  showOnModal: false,
                },
              }
            }
          }
        });
        setWeb3Auth(web3auth);
        if (web3auth.connected) {
          setProvider(web3auth.provider);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to initialize Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initWeb3Auth();
  }, []);

  const fetchAccountDetails = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = ethers.formatEther(await ethersProvider.getBalance(address));
      setAddress(address);
      setBalance(balance);
    } catch (error) {
      console.error("Failed to fetch account details:", error);
    }
  };

  const handleLogin = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      const provider = await web3auth.connect();
      setProvider(provider);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      setLoggedIn(true);
      await fetchAccountDetails();
    } catch (error: any) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setUserInfo(null);
      setAddress('');
      setBalance('');
      setLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    try {
//      const signedMessage = await RPC.signMessage(provider);
    } catch (error) {
      console.error(""); // T.B.D.
    }
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    try {
//      const transactionReceipt = await RPC.sendTransaction(provider);
    } catch (error) {
      console.error(""); // T.B.D.
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" minHeight="100vh" bgcolor="#f5f5f5" padding={2}>
      <Card sx={{ maxWidth: 400, width: "100%", padding: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom align="center">
            Web3Auth Demo
          </Typography>
          {!loggedIn ? (
            <Box textAlign="center">
              <Button variant="contained" color="primary" size="large" onClick={handleLogin} fullWidth sx={{ marginTop: 2 }}>
                Login with Web3Auth
              </Button>
            </Box>
          ) : (
            <>
            <Box textAlign="center">
              {userInfo?.picture && (
                <Avatar src={userInfo.picture} alt="User Avatar" sx={{ width: 80, height: 80, margin: "10px auto" }}/>
              )}
              <Typography variant="h6" gutterBottom>Welcome, {userInfo?.name || "User"}</Typography>
              <Typography variant="body1" gutterBottom>Address: {address}</Typography>
              <Typography variant="body1" gutterBottom>Balance: {balance} ETH</Typography>
              <Box
                sx={{
                  backgroundColor: "#f0f0f0",
                  padding: 2,
                  borderRadius: 1,
                  marginBottom: 2,
                  textAlign: "left",
                  overflowWrap: "break-word",
                }}
              >
                <Typography variant="body2">
                  {JSON.stringify(userInfo, null, 2)}
                </Typography>
              </Box>
              <Button variant="contained" color="secondary" size="large" onClick={handleLogout} fullWidth sx={{ marginTop: 2 }}>
                Logout
              </Button>
            </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default App;
