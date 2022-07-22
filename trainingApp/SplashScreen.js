import React, { Component } from 'react';
import { StyleSheet, Image, ImageBackground, View, Text, StatusBar, SafeAreaView, Platform,BackHandler,Alert } from 'react-native';
import Constants from '../utils/Constants';
import strings from '../utils/Localization';
import fontSelector from '../utils/FontSelector';
import * as Colors from '../utils/Colors';
import AsyncStorage from '@react-native-community/async-storage';
import ForceUpdateComponent from '../components/ForceUpdateComponent';
import DeviceInfo from 'react-native-device-info';
import Links from '../utils/Links';
// import RNExitApp from 'react-native-exit-app'
import InReviewUpdate from '../components/InReviewUpdate';

export default class SplashScreen extends Component {

  componentDidMount = async () => {
    strings.setLanguage(Constants.LANGUAGE_KOREAN_KO);
    await AsyncStorage.setItem(Constants.STORAGE_KEY_LANGUAGE, Constants.LANGUAGE_KOREAN_KO);
    this.userId = await AsyncStorage.getItem(Constants.STORAGE_KEY_USER_ID);
    this.apiKey = await AsyncStorage.getItem(Constants.STORAGE_KEY_API_KEY);
    this.selectedLanguage = await AsyncStorage.getItem(Constants.STORAGE_KEY_LANGUAGE);
    this.skipTime = await AsyncStorage.getItem(Constants.STORAGE_KEY_SKIP_UPDATE_DATE);
    console.log("this.skipTime", this.skipTime)
    if (this.skipTime) {
      var msDiff = new Date().getTime() - this.skipTime;    //Future date - current date
      this.dayDifference = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      console.log(" this.dayDifference", this.dayDifference)
    }

    try {
      setTimeout(async () => {
        if (this.selectedLanguage != "") {
          strings.setLanguage(this.selectedLanguage);
          this.forceUpdate();
        }
        try {
          //서버 점검 체크
          const res = await fetch(Links.SERVER_CHECK, {
            method: 'POST',
            // body: formData,
            headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data; charset=utf-8; boundary="+ Math.random().toString().substr(2),
                // "Content-Type": "multipart/form-data; charset=utf-8; boundary="+ Math.random().toString().substr(2),
            },
          });
          // const tmp = await res.text();
          // console.log(tmp)
          const responseJSON = await res.json();
          if(responseJSON.success == true && responseJSON.status == 'Y'){ //점검중
            Alert.alert(
              "알림",
              `${responseJSON.notice}\n\n${responseJSON.start} ~ ${responseJSON.end}`,
              [
                { text: "OK", onPress: () => BackHandler.exitApp() }
              ]
            );
          } else 
          { //점검아님
            this.forceUpdate = await new ForceUpdateComponent();
            let responseJSONStr = await this.forceUpdate.callForceUpdate(
              this.forceUpdateStatus.bind(this),
            );
          }
        } catch (error) { 
          console.log(error)
        }


      }, 2000);
    } catch (error) { }
  };

  checkVersion = async (versionMinimum, latestVersion, showUpdate) => {
    const appVersion = DeviceInfo.getVersion();
    console.log("app version", appVersion);
    if (showUpdate === "y") {
      if (appVersion < versionMinimum) {
        this.props.navigation.reset({
          index: 0,
          routes: [{ name: 'ForceUpdate', params: { forceUpdate: "y", latestVersion: latestVersion } }],
        });
      } else if ((appVersion > versionMinimum || appVersion == versionMinimum) && appVersion < latestVersion) {
        if (this.skipTime) {
          if (this.dayDifference > 2) {
            this.props.navigation.reset({
              index: 0,
              routes: [{ name: 'ForceUpdate', params: { forceUpdate: "n", latestVersion: latestVersion } }],
            });
          } else {
            this.navigateToScreen();
          }
        } else {
          await AsyncStorage.setItem(Constants.STORAGE_KEY_SKIP_UPDATE_DATE, "");
          this.props.navigation.reset({
            index: 0,
            routes: [{ name: 'ForceUpdate', params: { forceUpdate: "n", latestVersion: latestVersion } }],
          });
        }
      } else {
        this.navigateToScreen();
      }
    } else {
      this.navigateToScreen();

    }
  }

  navigateToScreen() {
    if (this.userId && this.apiKey) {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'MainScreen' }],
      });

    } else {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'PostSplashScreen' }],
      });
    }
  }


  forceUpdateStatus = async (androidMinimum, androidVersion, iosMinimum, iosVersion, showUpdate) => {
    console.log("androidMinimum", androidMinimum)
    console.log("iosMinimum", iosMinimum)

    if (Platform.OS === "android") {
      this.checkVersion(androidMinimum, androidVersion, showUpdate);
    } else {
      this.checkVersion(iosMinimum, iosVersion, showUpdate);
    }
  }



  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="#2B2325"
          barStyle="light-content"
        />

        <ImageBackground style={styles.imgBackground}
          resizeMode='cover'
          source={require('../images/icon_splash_background.png')}>

          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginBottom: 30 }}>
            <Image
              source={require('../images/icon_splash_logo.png')}
              style={{
                width: 100, resizeMode: 'contain', height: 100,
              }}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: "#2B6CB4",
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1
  },

  textStyle: {
    color: Colors.splash_text_color,
    fontSize: 16,
    fontFamily: fontSelector('medium'),
    marginBottom: 20,
    textAlign: 'center'
  },
});
