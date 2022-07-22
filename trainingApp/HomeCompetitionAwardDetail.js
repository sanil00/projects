import React, { Component } from "react"
import { ActivityIndicator, StyleSheet, View, SafeAreaView, Dimensions, BackHandler, Share } from "react-native"
import Constants from "../utils/Constants"
import StatusBar from "../common/StatusBar"
import * as Colors from "../utils/Colors"
import fontSelector from "../utils/FontSelector"
import Header from "../common/Header"
import { WebView } from "react-native-webview"
import AsyncStorage from "@react-native-community/async-storage"
import NetInfo from "@react-native-community/netinfo"
import Loader from "../components/Loader"
import Utils from "../utils/Utils"

// import RNFetchBlob from 'rn-fetch-blob';
// var RNFS = require('react-native-fs');

const height = Dimensions.get("window").height + StatusBar.currentHeight

//Start : Without this onMessage() will not work in react-native-webview
const injectedJavascript = `(function() {
    window.postMessage = function(data) {
      window.ReactNativeWebView.postMessage(data);
    };
  })()`

export default class HomeCompetitionAwardDetail extends React.Component {
    constructor(props) {
        super(props)
        this.WEBVIEW_REF = React.createRef()
        this.state = {
            user_id: "",
            api_key: "",
            isNetworkAvailable: false,
            webViewLoaded: false,
            url: props.route.params.url,
            canGoBack: false,
            previousCanGoBack: false,
        }
    }

    componentDidMount = async () => {
        this.userId = await AsyncStorage.getItem(Constants.STORAGE_KEY_USER_ID)
        this.apiKey = await AsyncStorage.getItem(Constants.STORAGE_KEY_API_KEY)

        // this.setData();
        this.networkChecking()
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButton)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton)
    }

    handleBackButton = () => {
        if (this.WEBVIEW_REF.current) {
            if (this.state.canGoBack) {
                this.WEBVIEW_REF.current.goBack()
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    onNavigationStateChange(navState) {
        if (this.state.previousCanGoBack != navState.canGoBack) {
            this.setState({
                canGoBack: navState.canGoBack,
                previousCanGoBack: navState.canGoBack,
            })
        }
    }

    networkChecking = () => {
        try {
            NetInfo.fetch().then((state) => {
                if (state.isConnected) {
                    this.setState({
                        isNetworkAvailable: true,
                        user_id: this.userId,
                        api_key: this.apiKey,
                        url: this.props.route.params.url,
                    })
                } else {
                    Utils.showMessageAlert()
                    this.setState({ isNetworkAvailable: false })
                }
            })
        } catch (error) {
            console.log("Network Problem : " + error)
        }
    }

    IndicatorLoadingView() {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={Constants.COLOR_LOADER} size="large" />
            </View>
        )
    }

    autoLogininWebPage = () => {
        return `(function(){resumeLogin("${this.state.user_id}","${this.state.api_key}")}());`
    }

    loadEnd = () => {
        this.setState({ webViewLoaded: true })
    }

    render() {
        return (
            <SafeAreaView style={styles.mainContainer}>
                <Header navigation={this.props.navigation} webview={this.WEBVIEW_REF.current} webviewBackStatus={this.state.canGoBack} />

                {this.state.isNetworkAvailable ? (
                    <View style={{ flex: 1 }}>
                        {!this.state.webViewLoaded && <Loader />}
                        <WebView
                            ref={this.WEBVIEW_REF}
                            onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                            style={{ flex: 1 }}
                            source={{ uri: this.state.url }}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            injectedJavaScript={injectedJavascript} //This is important without this onMessage() will not work in react-native-webview
                            onMessage={(m) => this.onMessage(m)} // this is needed to capture
                            onLoadEnd={() => this.loadEnd()}
                            originWhitelist={["*"]}
                            mixedContentMode={"compatibility"}
                        />
                    </View>
                ) : null}
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    containerLoginMain: {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        //backgroundColor: Colors.whiteBackgroudColor
    },
    container: {
        paddingHorizontal: 20,
        flex: 1,
        paddingTop: 20,
    },
    headerText: {
        flex: 1,
        color: Colors.black,
        fontSize: 16,
        fontFamily: fontSelector("medium"),
        textAlign: "center",
        alignSelf: "center",
        marginBottom: 2,
    },
    headercontainer: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        height: Constants.APPBAR_HEIGHT,
        elevation: 3,
        paddingHorizontal: 20,
        shadowColor: "#000",
        elevation: 4,
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        fontSize: 16,
        alignSelf: "center",
        fontFamily: fontSelector("regular"),
    },
    buttonStyle: {
        backgroundColor: Constants.COLOR_BUTTON_BACKGROUND,
        paddingVertical: 12,
        justifyContent: "center",
        borderRadius: 30,
        marginBottom: 50,
        marginHorizontal: 20,
        alignSelf: "stretch",
        marginTop: 20,
    },
    inputHeaderStyle: {
        color: "#000000",
        fontSize: 14,
        fontFamily: fontSelector("bold"),
        marginVertical: 10,
    },
    inputTextStyle: {
        color: "#000000",
        fontSize: 14,
        fontFamily: fontSelector("regular"),
        textAlign: "justify",
    },
    inputStyle: {
        color: "#000000",
        borderColor: "#A1A1A1",
        borderRadius: 5,
        borderWidth: 0.4,
        padding: 10,
        marginBottom: 15,
    },
    IndicatorStyle: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    loaderContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
})
