import React, { Component } from 'react';
import {
    StyleSheet, FlatList, TouchableOpacity, Image,
    View, Text, Share, Linking
} from 'react-native';
import Constants from '../utils/Constants';
import strings from '../utils/Localization';
import fontSelector from '../utils/FontSelector';
import AsyncStorage from '@react-native-community/async-storage';
import Loader from '../components/Loader';
import LoaderView from '../components/LoaderView';
import NetInfo from "@react-native-community/netinfo";
import Links from '../utils/Links';
import Utils from '../utils/Utils';
import Toast from 'react-native-simple-toast';
import Header from '../common/Header';
import HomeScreenCommunicator from '../components/HomeScreenCommunicator';
import FeedDetailCommunicator from '../components/FeedDetailCommunicator';
import DynamicLinkingCommunicator from '../components/DynamicLinkingCommunicator';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Hyperlink from 'react-native-hyperlink';
import { WebView } from 'react-native-webview';


const metaInjection = `const meta = document.createElement('meta');
meta.setAttribute('content','initial-scale=1, width=device-width');
meta.setAttribute('name','viewport');
document.getElementsByTagName('head')[0].appendChild(meta);`;


export default class HomeDetail extends Component {
    constructor(props) {
        super(props);
        this.WEBVIEW_REF = React.createRef();
        this.state = {
            isLoading: false,
            isViewLoading: false,
            header: "",
            date: "",
            description: "",
            images: [],
            likeCount: "",
            isLiked: "",
            hasInternet: false,
            webLink: "",
            views: 0,
        }
    }

    processDynamicLinking(params) {
        DynamicLinkingCommunicator.getInstance().setDynamicLink("");
        console.log("called111", params)
        var data = JSON.parse(params);
        this.id = data.id
        if (data.type == "feedId") {
            this.getNewsFeedDetail();
            return false;
        }
    }

    componentDidMount = async () => {
        this.userId = await AsyncStorage.getItem(Constants.STORAGE_KEY_USER_ID);
        this.apiKey = await AsyncStorage.getItem(Constants.STORAGE_KEY_API_KEY);
        this.id = this.props.route.params.id;
        FeedDetailCommunicator.getInstance().registerProcessDynamicLinking(this.processDynamicLinking.bind(this));
        this.getNewsFeedDetail();
    };


    getNewsFeedDetail() {
        try {
            NetInfo.fetch().then(state => {
                if (state.isConnected) {
                    this.setState({ hasInternet: true })
                    this.callNewsFeedDetailApi();
                }
                else {
                    this.setState({ hasInternet: false })
                    Utils.showMessageAlert()
                }
            });
        }
        catch (error) {
            console.log("Error in webservice call : " + error);
        }
    }

    callNewsFeedDetailApi = async () => {
        this.setState({ isLoading: true });

        var formData = new FormData();
        formData.append('user_id', this.userId);
        formData.append('post_id', this.id);
        formData.append('api_key', this.apiKey);
        formData.append('language', strings.getLanguage());

        try {
            console.log("homeDetailResponse to server ######################: ", JSON.stringify(formData));
            const res = await fetch(Links.HOME_NEWS_FEED_DETAIL, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });
            const responseJSON = await res.json();
            console.log("News Feed Details Response ######################: ", JSON.stringify(responseJSON));
            if (responseJSON) {
                var header = "";
                var date = "";
                var webLink = "";
                var description = "";
                var likeCount = "";
                var views = "";

                var images = [];
                if (responseJSON.hasOwnProperty("success") && responseJSON.success) {
                    if (responseJSON.hasOwnProperty("results") && responseJSON.results) {
                        var jsonResult = responseJSON.results;
                        if (jsonResult.hasOwnProperty('header') && jsonResult.header) {
                            header = jsonResult.header
                        }
                        if (jsonResult.hasOwnProperty('date') && jsonResult.date) {
                            date = Utils.parseUtcDate(jsonResult.date);
                        }
                        if (jsonResult.hasOwnProperty('web_link') && jsonResult.web_link) {
                            webLink = jsonResult.web_link
                        }
                        if (jsonResult.hasOwnProperty('is_liked') && jsonResult.is_liked) {
                            this.setState({
                                isLiked: jsonResult.is_liked
                            })
                        }
                        if (jsonResult.hasOwnProperty('description') && jsonResult.description) {
                            description = jsonResult.description
                        }
                        if (jsonResult.hasOwnProperty('images') && jsonResult.images) {
                            images = jsonResult.images
                        }
                        if (jsonResult.hasOwnProperty('views') && jsonResult.views) {
                            views = jsonResult.views
                        }

                        this.setState({
                            header: header,
                            date: date,
                            webLink: webLink,
                            description: description,
                            images: images,
                            likeCount: likeCount,
                            isLoading: false,
                            views:views
                        }, () => console.log("opop", this.state.webLink))

                    }

                }

                else if (responseJSON.hasOwnProperty("success")
                    && responseJSON.success == false) {
                    this.setState({ isLoading: false, isLoadingMore: false });
                    if (responseJSON.hasOwnProperty("error_message")
                        && responseJSON.error_message) {
                        Toast.show(responseJSON.error_message, Toast.SHORT);
                    } else {
                        Toast.show(strings.somethingWentWrong, Toast.SHORT);
                    }
                }
            }
            else {
                this.setState({ isLoading: false, isLoadingMore: false });
                Toast.show(strings.somethingWentWrong, Toast.SHORT);
            }
        }
        catch (error) {
            this.setState({ isLoading: false, isLoadingMore: false })
            Toast.show(strings.somethingWentWrong, Toast.SHORT);
            console.log("37 Exception in API call: " + error);
        }
        console.log(this.state.images[0]);
    }
    callLikeContent() {
        try {
            NetInfo.fetch().then(state => {
                if (state.isConnected) {
                    this.callLikeContentApi();
                }
                else {
                    Utils.showMessageAlert()
                }
            });
        }
        catch (error) {
            console.log("Error in webservice call : " + error);
        }
    }
    callLikeContentApi = async () => {
        this.setState({ isViewLoading: true });
        var formData = new FormData();
        formData.append('user_id', this.userId);
        formData.append('api_key', this.apiKey);
        formData.append('post_id', this.id);
        formData.append('language', strings.getLanguage());
        try {
            console.log("homeDetailResponse to server ######################: ", JSON.stringify(formData));
            const res = await fetch(Links.HOME_NEWS_FEED_LIKE, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });
            const responseJSON = await res.json();
            console.log("Like Response ######################: ", JSON.stringify(responseJSON));
            this.setState({ isViewLoading: false });
            var isLiked = "";
            if (responseJSON) {
                if (responseJSON.hasOwnProperty("success") && responseJSON.success) {
                    if (responseJSON.hasOwnProperty("success_message") && responseJSON.success_message) {
                        var id = this.id;
                        console.log(id)

                        if (this.state.isLiked == 'n') {
                            this.setState({
                                isLiked: "y"
                            })
                        }
                        else {
                            this.setState({
                                isLiked: "n"
                            })
                        }
                        HomeScreenCommunicator.getInstance().callRefreshLike(id);
                    }
                }
                else if (responseJSON.hasOwnProperty("success")
                    && responseJSON.success == false) {
                    if (responseJSON.hasOwnProperty("error_message") && responseJSON.error_message) {
                        Toast.show(responseJSON.error_message, Toast.SHORT);
                    } else {
                        Toast.show(strings.somethingWentWrong, Toast.SHORT);
                    }
                }
                else {
                    Toast.show(strings.somethingWentWrong, Toast.SHORT);
                }
            }
        }
        catch (error) {
            Toast.show(strings.somethingWentWrong, Toast.SHORT);
            console.log("38 Exception in API call: " + error);
        }
    }

    getValue(jObj, key, defaultValue) {
        if (jObj.hasOwnProperty(key) && jObj[key] && jObj[key] != null) {
            return jObj[key];
        }
        return defaultValue;
    }

    onShare = async (id) => {
        var imageUrl = "";
        if (this.state.images && this.state.images.length > 0) {
            imageUrl = this.state.images[0].image_url;
        }
        const link = await dynamicLinks().buildShortLink({
            link: encodeURI(`https://hjcheonbotrainingcenter.page.link/?feedId=${id}`),
            domainUriPrefix: "https://hjcheonbotrainingcenter.page.link",
            android: {
                packageName: "com.hjcheonbotrainingcenter.cbt",
                fallbackUrl: "https://play.google.com/store/apps/details?id=com.hjcheonbotrainingcenter.cbt"
            },
            ios: {
                appStoreId: '1571870039',
                bundleId: 'com.hjcheonbotrainingcenter.cbt',
                fallbackUrl: "https://apps.apple.com/us/app/cbt/id1571870039"
            },
            social: {
                title: this.state.header,
                //descriptionText: item.description,
                imageUrl: imageUrl
            },
            navigation: {
                forcedRedirectEnabled: true
            }
        }, dynamicLinks.ShortLinkType.UNGUESSABLE);
        console.log("link", link);
        await Share.share({
            message: Platform.OS === "android" ? link : null,
            url: link,
        }, {
            excludedActivityTypes: [
                'com.apple.UIKit.activity.PostToTwitter'
            ]
        })
    }


    render() {
        
        return (
            <View style={styles.container}>
                
                {this.state.isLoading && <Loader />}
                {this.state.isViewLoading && <LoaderView />}
                <Header navigation={this.props.navigation} />
                <View style={{flex:1}}>
                    {this.state.hasInternet &&
                        <View style={styles.cardStyle}> 
                            <View style={{ paddingHorizontal: 20, paddingTop: 20, flex:10 }}>
                                <View >
                                    <Text style={styles.headerTextStyle}>{this.state.header}</Text>
                                    <View style={{flexDirection:'row'}}>

                                    <Text style={styles.dateStyle} >{this.state.date}</Text>
                                    {/* 조회수 */}
                                    {/* <Text style={styles.dateStyle}>{'조회수:'+this.state.views}</Text> */}

                                    </View>

                                    {console.log("this.state.webLink", this.state.webLink)}
                                    {this.state.webLink ?
                                        <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => { Linking.openURL(this.state.webLink) }}>
                                            <Text style={styles.linkStyle}>{this.state.webLink}</Text>
                                        </TouchableOpacity>
                                        :
                                        null  
                                    }
                                </View>
                                <View style={{flex:3}}>
                                    <Hyperlink style={{flex:1}} onPress={Linking.openURL}
                                        linkDefault={true}
                                        linkStyle={styles.linkStyle} >
                                        {/* <Text style={styles.contentStyle}>
                                            {this.state.description}
                                        </Text> */}

                                        <WebView
                                        ref={this.WEBVIEW_REF}
                                        style={{alignItems:'stretch',opacity:0.99, minHeight:1}}
                                        originWhitelist={['*']}
                                        allowsFullscreenVideo={true} //전체화면 허용 hogil 220425
                                        source={{html: '<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>'+this.state.description}}
                                        javaScriptEnabled={true}
                                        injectedJavaScript={metaInjection}
                                        // scalesPageToFit={false}
                                        />
                                    </Hyperlink>
                                </View>
                                {/* <Text style={styles.contentStyle} >{this.state.description}</Text> */}
                            </View>
                            {this.state.images[0]== undefined ? 
                            null
                            :
                            <View style={{flex:2,paddingLeft:10,paddingRight:10, paddingTop:10}}>
                            <FlatList
                                contentContainerStyle={{}}
                                data={this.state.images}
                                extraData={this.state.images}
                                pagingEnabled={false}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TouchableOpacity
                                            style={{flex:0.5}}
                                            activeOpacity={0.7}
                                            onPress={() => this.props.navigation.navigate("HomeImageDetail", {
                                                imageIndex: index,
                                                id: this.id
                                            })}>
                                            <Image
                                                source={{ uri: item.image_url }}
                                                style={styles.imageStyle}
                                            />
                                        </TouchableOpacity>

                                    )
                                }}
                            />
                            </View>
                            

                            }

                            <View style={{ backgroundColor: "#E0E0E0", height: 1, marginHorizontal: 10 ,marginTop:20}}></View>
                            <View style={{ flexDirection: 'row', height:50}}>
                                <TouchableOpacity style={styles.cardItemStyle}
                                    activeOpacity={0.7}
                                    onPress={() => this.callLikeContent()}>
                                    <Image
                                        source={this.state.isLiked === "n" ? require('../images/icon_love.png') : require('../images/icon_filled_heart.png')}
                                        style={styles.shareImageStyle}
                                    />
                                    <Text style={styles.shareStyle}>{strings.like}</Text>
                                </TouchableOpacity>
                                <View style={{ backgroundColor: "#E0E0E0", width: 1, marginVertical: 8 }}></View>
                                <TouchableOpacity style={styles.cardItemStyle}
                                    activeOpacity={0.7}
                                    onPress={() => this.onShare(this.id)}>
                                    <Image
                                        source={require('../images/icon_share.png')}
                                        style={styles.shareImageStyle}
                                    />
                                    <Text style={styles.shareStyle}>{strings.share}</Text>
                                </TouchableOpacity>
                            </View>


                        </View>
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    cardStyle: {
        flex:1,
        backgroundColor: "#FFFFFF",
        marginBottom: 15,
        borderRadius: 10,
        marginHorizontal: 8,
        marginTop: 15,
        marginBottom: 25,
        elevation: 5,
        shadowColor: '#C4C4C4',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 9,
        shadowOpacity: 0.26,
    },
    tabImageStyle: {
        resizeMode: 'contain',
        height: 20,
        marginBottom: 5
    },
    bannerImageStyle: {
        height: 250,
        resizeMode: 'stretch',
        width: '100%',
        marginBottom: 15
    },
    headerTextStyle: {
        color: "#121212",
        fontSize: 18,
        fontFamily: fontSelector('medium'),
        marginBottom: 4,
    },
    dateStyle: {
        color: "#828282",
        fontSize: 13,
        fontFamily: fontSelector('regular'),
        marginBottom: 8
    },
    contentStyle: {
        color: "#121212",
        fontSize: 15,
        fontFamily: fontSelector('light'),
        textAlign: 'justify',
    },
    imageStyle: {
        width: 130,
        height: 130,
        resizeMode: 'cover',
        backgroundColor: "#000000CC",
        marginRight: 4,
        paddingTop:10,
        paddingRight:10,

    },
    shareStyle: {
        color: "#121212",
        fontSize: 15,
        fontFamily: fontSelector('regular'),
        marginLeft: 3,
        alignSelf: 'center'
    },
    shareImageStyle: {
        height: 18,
        width: 18,
        resizeMode: "contain",
        marginRight: 3,
        alignSelf: 'center'
    },
    cardItemStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
    },
    linkStyle: {
        color: "#2B6CB4",
        fontSize: 15,
        fontFamily: fontSelector('regular'),
        //marginTop: 10,
        marginBottom: 15
    }
});
