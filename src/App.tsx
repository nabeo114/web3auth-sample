import React, { useEffect, useState } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Box, Button, Card, CardContent, CircularProgress, Typography, Avatar, } from '@mui/material';
import config from '../config';

const App: React.FC = () => {
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
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
                chainId: "0x534e5f41", // Amoy Testnet
                rpcTarget: `https://polygon-amoy.infura.io/v3/${infuraApiKey}`,
              }
            }
          }),
        });
        await web3auth.initModal();
        setWeb3Auth(web3auth);
      } catch (error) {
        console.error("Failed to initialize Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initWeb3Auth();
  }, [clientId]);

  const login = async () => {
    if (!web3auth) return;
    try {
      const provider = await web3auth.connect();
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      console.log("Connected Provider:", provider);
    } catch (error: any) {
      // 特定のエラーメッセージを確認して無視
      if (error.message === "User closed the modal") {
        console.info("Login modal was closed by the user.");
      } else {
        console.error("Login failed:", error);
      }
    }
  };

  const logout = async () => {
    if (!web3auth) return;
    try {
      await web3auth.logout();
      setUserInfo(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      padding={2}
    >
      <Card sx={{ maxWidth: 400, width: "100%", padding: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom align="center">
            Web3Auth Demo
          </Typography>
          {!userInfo ? (
            <Box textAlign="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={login}
                fullWidth
                sx={{ marginTop: 2 }}
              >
                Login with Web3Auth
              </Button>
            </Box>
          ) : (
            <Box textAlign="center">
              {userInfo.picture && (
                <Avatar
                  src={userInfo.picture}
                  alt={userInfo.name || "User"}
                  sx={{
                    width: 80,
                    height: 80,
                    margin: "10px auto",
                  }}
                />
              )}
              <Typography variant="h6" gutterBottom>
                Welcome, {userInfo.name || "User"}
              </Typography>
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
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={logout}
                fullWidth
                sx={{ marginTop: 2 }}
              >
                Logout
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default App;
