import React, { Component } from 'react';
import {
  StyleSheet, Image, View, Text, StatusBar, SafeAreaView,
  FlatList, TouchableOpacity
} from 'react-native';
import AdaptiveStatusBar from '../common/AdaptiveStatusBar';
import Constants from '../utils/Constants';
import strings from '../utils/Localization';
import fontSelector from '../utils/FontSelector';
import * as Colors from '../utils/Colors';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import Links from '../utils/Links';
import Toast from 'react-native-simple-toast';
import Loader from '../components/Loader';
import Utils from '../utils/Utils';
import Header from '../common/Header';


export default class MyCompetitionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isNetworkAvailable: false,
      isLoading: false,
      data: [],
      dataLoaded: false,
      isFetching: false,
      prvData: [],
      isConnected:true
    }
  }

  componentDidMount = async () => {
    this.userId = await AsyncStorage.getItem(Constants.STORAGE_KEY_USER_ID);
    this.apiKey = await AsyncStorage.getItem(Constants.STORAGE_KEY_API_KEY);
    const { navigation } = this.props;
    // this.focusListener = navigation.addListener("focus", () => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          this.setState({
            isNetworkAvailable: true
          }, () => {
            if (this.state.dataLoaded === false) {
              this.loadCompetitionList();
            }
          })
        }
        else {
          Utils.showMessageAlert();
          this.setState({
            isNetworkAvailable: false
          })
        }
      });
    // });
  };

  componentWillUnmount() {
    try {
      // this.focusListener();
    } catch (error) {
      console.log(error);
    }
  }

  loadCompetitionList() {
    try {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          this.callCompetitionListApi();
          this.setState({ isNetworkAvailable: true })
        }
        else {
          Utils.showMessageAlert()
          this.setState({ isNetworkAvailable: false })
        }
      });
    }
    catch (error) {
      console.log("Error in webservice call : " + error);
    }
  }

  callCompetitionListApi = async () => {
    this.setState({ isLoading: true });

    var formData = new FormData();
    formData.append('user_id', this.userId);
    formData.append('api_key', this.apiKey);
    formData.append('language', strings.getLanguage());

    try {
      // console.log("myCompetitionListResponse to server ######################: ", JSON.stringify(formData));
      const res = await fetch(Links.MYCOMPETITION_LIST, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      const responseJSON = await res.json();
      // console.log("Notice Board List Response ######################: ", JSON.stringify(responseJSON));
      if (responseJSON) {
        this.setState({ isLoading: false, dataLoaded: true, isFetching: false });
        if (responseJSON.hasOwnProperty("success") && responseJSON.success) {
          var mesage = "";
          var resultsData = [];
          if (responseJSON.success_message != null) {
            mesage = responseJSON.success_message;
          }
          if (responseJSON.results != null) {
            resultsData = responseJSON.results;

            if (JSON.stringify(this.state.prvData) == JSON.stringify(resultsData)) {
              // console.log("Not saved");
            } else {
              // console.log("Saved");
              this.setState({ data: resultsData, prvData: resultsData })
            }
          }
          // this.setState({ data: resultsData })
        }
        else if (responseJSON.hasOwnProperty("success")
          && responseJSON.success == false) {
          if (responseJSON.hasOwnProperty("error_message") && responseJSON.error_message) {
            Toast.show(responseJSON.error_message, Toast.SHORT);
          } else {
            Toast.show(strings.somethingWentWrong, Toast.SHORT);
          }
        }
      }
    }
    catch (error) {
      this.setState({ isLoading: false, isFetching: false });
      Toast.show(strings.somethingWentWrong, Toast.SHORT);
      console.log("46 Exception in API call77777: " + error);
    }

  }

 

  setItemClick = (item) => {
    // this.props.navigation.navigate('CompetitionCategoryScreen', { categoryId: id })
    const url = Links.COMPETITION_MOD+'?competition='+item.cp_code+'&userId='+item.mb_no
    console.log(url)
    this.props.navigation.navigate('MyCompetitionDetail', { url: url, data : item });

  }

  setRenderItemView = ({ item, index }) => {
    return (
      <View style={styles.viewCont}>
        <TouchableOpacity activeOpacity={0.7} style={styles.itemContainer} onPress={() => this.setItemClick(item)}>
          <View style={styles.rowViewContainer}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingStyle} key={index}> {item.title} </Text>
            </View>
            <View style={styles.iconViewContainer}>
              <Image source={require('../images/grey_right_arrow.png')} style={styles.downArrowIconStyle} />
            </View>
          </View>
          <View style={styles.borderStyle}></View>
        </TouchableOpacity>
      </View>
    );
  }

  onRefresh() {
    this.setState({ isFetching: true, }, () => { this.loadCompetitionList(); });
  }

  placeholderView = () => {
    return (
      <Text style={styles.noRecordTextStyle} > {strings.noRecordFound} </Text>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={this.props.navigation}>
            {/* <View style={styles.pageHeaderMainContainer}>
              <Text style={styles.pageTitleTextStyle} numberOfLines={1} > {strings.Competition} </Text>
            </View> */}
        </Header>
        {this.state.isLoading && !this.state.isFetching ? <Loader /> : null}
        <AdaptiveStatusBar />
        {this.state.isNetworkAvailable ?
          <View style={styles.viewStyle}>

            <View style={styles.viewContainer}>
              <FlatList
                data={this.state.data}
                renderItem={(i, index) => this.setRenderItemView(i, index)}
                listKey={(itemTwo, index) => 'N' + index.toString()}
                keyExtractor={(itemTwo, index) => index.toString()}
                onRefresh={() => this.onRefresh()}
                refreshing={this.state.isFetching}
                ListEmptyComponent={this.placeholderView()}
                contentContainerStyle={this.state.data.length === 0 && styles.centerEmptySet}
              />
            </View>
          </View>
          :
          null
        }
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  viewStyle: {
    flex: 1,
    flexDirection: 'column',
  },
  pageHeaderMainContainer: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 1,
    shadowOpacity: 0.3,
  },
  pageTitleTextStyle: {
    fontSize: 20,
    fontFamily: fontSelector("bold"),
    textAlign: 'center',
    color: Colors.black,
    marginVertical: 15,
    marginHorizontal: 20,
  },
  viewContainer: {
    flex: 1,
    marginTop: 10
  },
  itemContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    elevation: 4
  },
  headingContainer: {
    flex: 5,
    justifyContent: 'center',
    // backgroundColor: 'purple',
  },
  headingStyle: {
    backgroundColor: Colors.white,
    color: Colors.textColor3,
    fontSize: 17,
    textAlignVertical: 'center',
    fontFamily: fontSelector("regular"),
    paddingVertical: 15,
  },
  iconViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    // backgroundColor: 'yellow',
  },
  downArrowIconStyle: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  borderStyle: {
    backgroundColor: Colors.borderColor2,
    height: 1,
  },
  rowViewContainer: {
    flexDirection: 'row',
    marginStart: 15,
    padding: 0
  },
  subItemContianer: {
    backgroundColor: Colors.barcodeContainerColor,
  },
  flatlistStyle: {
    paddingVertical: 10
  },
  titleStyle: {
    backgroundColor: Colors.barcodeContainerColor,
    color: Colors.textColor3,
    fontSize: 15,
    fontFamily: fontSelector("regular"),
    marginHorizontal: 20,
    paddingVertical: 10
  },
  noRecordTextStyle: {
    fontSize: 17,
    fontFamily: fontSelector("medium"),
    color: Colors.black,
    textAlign: 'center',
    alignSelf: 'center'
  },
  centerEmptySet: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
