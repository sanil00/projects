import React, { Component } from "react"
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, Image, Alert, Platform } from "react-native"
import Constants from "../utils/Constants"
import strings from "../utils/Localization"
import AsyncStorage from "@react-native-community/async-storage"
import NetInfo from "@react-native-community/netinfo"
import Links from "../utils/Links"
import Toast from "react-native-simple-toast"
import Loader from "../components/Loader"
import Utils from "../utils/Utils"
import Header from "../common/Header"
import { Calendar } from "react-native-calendars"
import { BLUEGLAY, CORNBLUE, MAINCOLOR } from "../common/colors"
import WebView from "react-native-webview"
import RenderHtml, { IMGElementProps } from "react-native-render-html"
import { useWindowDimensions } from "react-native"
import RNFetchBlob from "rn-fetch-blob"
import { Fonts } from "../utils/Fonts"

let { width, height } = Dimensions.get("window")
const diviceWidthFontLarge = width * 0.05
const diviceWidthFontSmall = width * 0.07

let monthCounst = 0

export default class MenuPlannerCalendar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pageTitle: props.route.params.pageTitle,
            isNetworkAvailable: false,
            isLoading: true,
            menuData: [],
            planData: [],
            dataLoaded: false,
            isFetching: false,
            prvData: [],
            isConnected: true,
            menu: true,
            selectDay: "",
            menuDate: {},
            markedDates: {},
            source: { html: `` },
            worker: false,
            planDataArr: [],
            fontsLoaded: false,
        }
    }

    componentDidMount = async () => {
        this.userId = await AsyncStorage.getItem(Constants.STORAGE_KEY_USER_ID)
        this.apiKey = await AsyncStorage.getItem(Constants.STORAGE_KEY_API_KEY)
        const { navigation } = this.props
        NetInfo.fetch().then((state) => {
            if (state.isConnected) {
                this.setState(
                    {
                        isNetworkAvailable: true,
                    },
                    () => {
                        if (this.state.dataLoaded === false) {
                            this.loadCompetitionList()
                        }
                    }
                )
            } else {
                Utils.showMessageAlert()
                this.setState({
                    isNetworkAvailable: false,
                })
            }
        })
    }
    loadCompetitionList() {
        try {
            NetInfo.fetch().then((state) => {
                if (state.isConnected) {
                    this.callPlannerListApi()
                    this.setState({ isNetworkAvailable: true })
                } else {
                    Utils.showMessageAlert()
                    this.setState({ isNetworkAvailable: false })
                }
            })
        } catch (error) {
            console.log("Error in webservice call : " + error)
        }
    }

    callPlannerListApi = async () => {
        let formData = new FormData()
        const selectMonth = "default"

        formData.append("select_date", selectMonth)

        formData.append("user_id", this.userId)
        formData.append("api_key", this.apiKey)
        formData.append("language", strings.getLanguage())

        try {
            // console.log("myCompetitionListResponse to server ######################: ", JSON.stringify(formData));
            const res = await fetch(Links.MENUPLANNERLISTNOW, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            })

            // console.log(await res.text());
            const responseJSON = await res.json()

            let date = {}
            let today = new Date()
            let year = today.getFullYear()
            let month = ("0" + (today.getMonth() + 1)).slice(-2)
            let day = ("0" + today.getDate()).slice(-2)
            date.dateString = year + "-" + month + "-" + day

            this.setState({
                menuData: responseJSON.menuResults,
                menuDate: responseJSON.marks,
                markedDates: responseJSON.marks,
                planData: responseJSON.planResults,
                today: date.dateString,
                isLoading: false,
                worker: responseJSON.worker,
            })
            this.setSelect(date)

            this.setMenu(date)
            this.setPlanner(date)
            // console.log("THIS IS DATA ######################: ");

            // this.setState({today:date["dateString"]})
            // this.setState({ isLoading: false });
        } catch (error) {
            this.setState({ isLoading: true, isFetching: false })
            Toast.show(strings.somethingWentWrong, Toast.SHORT)
            // console.log(" Exception in API call77777: " + error);
        }
    }

    changeMonthClick = async (date) => {
        const selectMonth = date.year + "-" + date.month
        let formData = new FormData()
        formData.append("user_id", this.userId)
        formData.append("api_key", this.apiKey)
        formData.append("language", strings.getLanguage())
        formData.append("select_date", selectMonth)

        try {
            // console.log("myCompetitionListResponse to server ######################: ", JSON.stringify(formData));
            const res = await fetch(Links.MENUPLANNERLISTNOW, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            })

            const responseJSON = await res.json()
            const tmp = { ...responseJSON.menuResults, ...this.state.menuData }
            const tmp2 = { ...responseJSON.planResults, ...this.state.planData }
            const dates = { ...responseJSON.marks, ...this.state.menuDate }
            const markedDate = { ...responseJSON.marks, ...this.state.markedDates }

            // console.log("myCompetitionListResponse to server ######################: ", JSON.stringify(dates));

            this.setState({ menuData: tmp, planData: tmp2, menuDate: dates, markedDates: markedDate })

            // console.log("menuDate ######################: ", JSON.stringify(this.state.menuDate));
        } catch (error) {
            this.setState({ isLoading: true, isFetching: false })
            Toast.show(strings.somethingWentWrong, Toast.SHORT)
            console.log(" Exception in API call select: " + error)
        }
    }

    setMenu = (date) => {
        const currentClickData = this.state.menuData[date.dateString]

        let breakfast
        let lunch
        let dinner
        let menu

        if (currentClickData != undefined) {
            //식단
            if (currentClickData.cm_lunch.length == 0 && currentClickData.cm_dinner.length == 0 && currentClickData.cm_breakfast.length == 0) {
                menu = false
            } else {
                if (currentClickData.cm_breakfast.length === 0) {
                    breakfast = "x"
                } else {
                    breakfast = currentClickData.cm_breakfast
                }

                if (currentClickData.cm_lunch.length === 0) {
                    lunch = "x"
                } else {
                    lunch = currentClickData.cm_lunch
                }

                if (currentClickData.cm_dinner.length === 0) {
                    dinner = "x"
                } else {
                    dinner = currentClickData.cm_dinner
                }
                menu = true
                breakfast
                lunch
                dinner
            }
        } else {
            menu = false
        }

        this.setState({ currentDay: date.dateString, menu, breakfast, lunch, dinner })
    }

    setPlanner = (date) => {
        const currentPlanData = this.state.planData[date.dateString]
        const worker = this.state.worker

        let notice
        let planDataArr = []
        let arrayDownloadName = []
        let arrayDownloadLink = []

        if (worker) {
            for (key in currentPlanData) {
                const jObjFinal = {}
                let source = ""
                jObjFinal["text"] = currentPlanData[key].schedule
                jObjFinal["name"] = currentPlanData[key].upload_original_file

                jObjFinal["title"] = currentPlanData[key].title
                jObjFinal["startDay"] = currentPlanData[key].cm_start_date
                jObjFinal["endDay"] = currentPlanData[key].cm_end_date
                jObjFinal["startTime"] = currentPlanData[key].start_time
                jObjFinal["endTime"] = currentPlanData[key].end_time
                jObjFinal["place_main"] = currentPlanData[key].place_main
                jObjFinal["place_sub"] = currentPlanData[key].place_sub
                jObjFinal["writer"] = currentPlanData[key].writer

                jObjFinal["source"] = { html: currentPlanData[key].schedule }

                arrayDownloadLink = currentPlanData[key].upload_file
                arrayDownloadName = currentPlanData[key].upload_original_file

                planDataArr.push(jObjFinal)
            }
        } else {
            for (key in currentPlanData) {
                if (currentPlanData[key].type == 0) {
                    //사용자가 직원이 아닐 때는 type=0 만 표출

                    const jObjFinal = {}
                    let source = ""
                    jObjFinal["text"] = currentPlanData[key].schedule
                    jObjFinal["name"] = currentPlanData[key].upload_original_file
                    jObjFinal["link"] = currentPlanData[key].upload_file

                    jObjFinal["title"] = currentPlanData[key].title
                    jObjFinal["startDay"] = currentPlanData[key].cm_start_date
                    jObjFinal["endDay"] = currentPlanData[key].cm_end_date
                    jObjFinal["startTime"] = currentPlanData[key].start_time
                    jObjFinal["endTime"] = currentPlanData[key].end_time
                    jObjFinal["place_main"] = currentPlanData[key].place_main
                    jObjFinal["place_sub"] = currentPlanData[key].place_sub

                    jObjFinal["writer"] = currentPlanData[key].writer

                    jObjFinal["source"] = { html: currentPlanData[key].schedule }

                    arrayDownloadLink = currentPlanData[key].upload_file
                    arrayDownloadName = currentPlanData[key].upload_original_file

                    planDataArr.push(jObjFinal)
                }
            }
        }

        if (currentPlanData != undefined) {
            notice = true
        } else {
            notice = false
        }

        this.setState({ planDataArr, notice })
    }

    setSelect = (date) => {
        let selectDate = { ...this.state.markedDates }
        selectDate[date.dateString] = { selected: true }
        this.setState({ menuDate: selectDate, selectDay: date })
    }

    download = (index, aLink, aDown) => {
        let arrayDownloadLink = aLink
        let arrayDownloadName = aDown

        Alert.alert(
            "다운로드 하시겠습니까?",
            arrayDownloadName[index],
            [
                {
                    text: "예",
                    onPress: () => {
                        RNFetchBlob.config({
                            path: `${RNFetchBlob.fs.dirs.DocumentDir}/${arrayDownloadName[index]}`,
                            fileCache: true,
                            addAndroidDownloads: {
                                notification: true,
                                useDownloadManager: true,
                            },
                        })
                            .fetch("GET", `${Links.DOWNLOAD}${arrayDownloadLink[index]}`)
                            .then((res) => {
                                // the temp file path
                                console.log("The file saved to ", res.path())
                            })
                    },
                    style: "cancel",
                },
                { text: "아니오", onPress: () => {} },
            ],
            { cancelable: false }
        )
    }

    planners(currentThis) {
        let planner = currentThis.value
        let planState = planner.state.planDataArr

        return (
            <View>
                {planState.map((value, index) => {
                    let source = ""
                    let arrayDownloadLink = value.link
                    let arrayDownloadName = value.name
                    let text = ""
                    // console.log('arrayDownloadName:@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@: ' +  arrayDownloadName)
                    if (Platform.OS === "android") {
                        if (typeof arrayDownloadLink === "object" && arrayDownloadLink[0] != "") {
                            arrayDownloadLink.map((value, index) => {
                                source += `<a href='${Links.DOWNLOAD}${value}' download='${arrayDownloadName[index]}'>${arrayDownloadName[index]}</a></br>`
                            })
                        }
                        text = { html: source }
                    } else {
                        if (arrayDownloadName[0] == "") {
                            // arrayDownloadName = []
                        }
                    }

                    return (
                        <View style={styles.NoticeContainer} key={index}>
                            <View style={styles.smallBox3}>
                                <Text style={styles.txtTitle}>{value.title}</Text>
                            </View>

                            <View style={{ flexDirection: "row" }}>
                                {value.startDay === value.endDay ? (
                                    <View style={styles.smallBox1}>
                                        <View>
                                            <Text style={styles.timeDate}>날짜: {value.startDay}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.timeDate}>
                                                시간:
                                                {value.startTime == null && value.endTime == null ? (
                                                    ""
                                                ) : (
                                                    <Text>
                                                        {" "}
                                                        {value.startTime}~{value.endTime}{" "}
                                                    </Text>
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.smallBox1}>
                                        <View>
                                            <Text style={styles.timeDate}>
                                                시작: {value.startDay} {value.startTime}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.timeDate}>
                                                종료: {value.endDay} {value.endTime}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                <View style={styles.smallBox2}>
                                    <View>
                                        <Text style={styles.txtPlace}> {value.place_main}</Text>
                                        <Text style={styles.txtPlace}> {value.place_sub}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.NoticeContainer2}>
                                <RenderHtml tagsStyles={{ p: { padding: 0, margin: 0 } }} ignoredStyles={["maxWidth"]} contentWidth={width * 0.9} source={value.source} />

                                {typeof arrayDownloadLink === "object" && arrayDownloadLink[0] != "" ? (
                                    <View>
                                        <View style={styles.attachedFile}>
                                            <Text style={styles.txtAttached}>첨부파일</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View></View>
                                )}

                                {text != "" ? (
                                    <View>
                                        <RenderHtml contentWidth={width} source={text} />
                                    </View>
                                ) : (
                                    <View>
                                        {typeof arrayDownloadName === "object" && arrayDownloadName != "" ? (
                                            <View>
                                                {arrayDownloadName.map((value, index) => {
                                                    return (
                                                        <TouchableOpacity key={index} onPress={() => planner.download(index, arrayDownloadLink, arrayDownloadName)}>
                                                            <Text style={{ color: "blue" }}>{value}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                })}
                                            </View>
                                        ) : (
                                            <View></View>
                                        )}
                                    </View>
                                )}
                                {value.writer != "" && value.writer != null ? (
                                    <View>
                                        <Text style={styles.txtWriter}>작성자: {value.writer}</Text>
                                    </View>
                                ) : (
                                    <View></View>
                                )}
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }
    render() {
        let totalDate = this.state.menuDate

        return (
            <View style={{ height: "100%" }}>
                {this.state.isLoading && <Loader />}
                <Header title={this.state.pageTitle} navigation={this.props.navigation} style={{ flex: 1 }}></Header>

                <View style={{ flex: 1 }}>
                    <View style={styles.calendarContainer}>
                        <ScrollView style={styles.plannerContainer}>
                            <Calendar
                                onDayPress={(day) => {
                                    this.setMenu(day)
                                    this.setSelect(day)
                                    this.setPlanner(day)
                                }}
                                markingType={"multi-dot"}
                                markedDates={totalDate}
                                onMonthChange={(month) => {
                                    this.changeMonthClick(month)
                                }}
                                theme={{
                                    dotStyle: { width: 6, height: 5 },
                                    arrowColor: MAINCOLOR,
                                    textDayFontSize: 16,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 16,
                                }}
                                // theme={{
                                //   dayTextColor: '#d9e1e8',
                                //   arrowColor: MAINCOLOR,
                                //   textDayFontSize: 16,
                                //   textMonthFontSize: 16,
                                //   textDayHeaderFontSize: 16
                                // }}
                                enableSwipeMonths={true}
                            />
                            <View>
                                <View style={styles.doubleLine}></View>
                            </View>
                            <View>
                                <View style={styles.dinnerContainer}>
                                    <View style={{ alignSelf: "center", justifyContent: "center" }}>
                                        <Text style={{ color: MAINCOLOR, fontSize: 25, alignSelf: "center", fontWeight: "bold", marginTop: 10, paddingVertical: 10 }}>{this.state.currentDay}</Text>
                                    </View>
                                </View>
                            </View>

                            {this.state.menu ? (
                                <View style={{ paddingBottom: 20 }}>
                                    <View>
                                        {this.state.breakfast != "x" ? (
                                            <View style={styles.dinnerContainer}>
                                                <View style={styles.dinnerBox}>
                                                    <View style={styles.menuDinnerBox}>
                                                        <View style={{ borderBottomWidth: 1, borderColor: "#00ADF5" }}>
                                                            <Text style={{ color: "#ffffff", textAlign: "center", fontSize: 25, marginVertical: 10 }}>아침</Text>
                                                        </View>
                                                        <Text style={{ color: "#ffffff", fontSize: 16, lineHeight: 25, textAlign: "center", paddingVertical: 10 }}>{this.state.breakfast}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : (
                                            <View></View>
                                        )}
                                    </View>
                                    <View>
                                        {this.state.lunch != "x" ? (
                                            <View style={styles.lunchContainer}>
                                                <View style={styles.lunchBox}>
                                                    <View style={styles.menuLunchBox}>
                                                        <View style={{ borderBottomWidth: 1, borderColor: "#00ADF5" }}>
                                                            <Text style={{ color: MAINCOLOR, fontFamily: Fonts.NSRoundR, textAlign: "center", fontSize: 25, marginVertical: 10 }}>점심</Text>
                                                        </View>
                                                        <Text style={{ color: MAINCOLOR, fontSize: 16, lineHeight: 25, textAlign: "center", paddingVertical: 10 }}>{this.state.lunch}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : (
                                            <View></View>
                                        )}
                                    </View>
                                    <View>
                                        {this.state.dinner != "x" ? (
                                            <View style={styles.dinnerContainer}>
                                                <View style={styles.dinnerBox}>
                                                    <View style={styles.menuDinnerBox}>
                                                        <View style={{ borderBottomWidth: 1, borderColor: "#00ADF5" }}>
                                                            <Text style={{ color: "#ffffff", textAlign: "center", fontSize: 25, marginVertical: 10 }}>저녁</Text>
                                                        </View>
                                                        <Text style={{ color: "#ffffff", fontSize: 16, lineHeight: 25, textAlign: "center", paddingVertical: 10 }}>{this.state.dinner}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : (
                                            <View></View>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    {this.state.planDataArr.length > 0 ? (
                                        <View></View>
                                    ) : (
                                        <View>
                                            <View style={styles.dinnerContainer}>
                                                <View style={styles.EmptyMenuBox}>
                                                    <Text style={{ color: "#ffffff", fontSize: diviceWidthFontLarge, fontWeight: "bold" }}>금일 일정 및 식단이 없습니다.</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                            {this.state.planDataArr.length > 0 ? (
                                <View>
                                    <this.planners value={this} />
                                </View>
                            ) : (
                                <View></View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    doubleLine: {
        marginTop: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 3,
        borderColor: CORNBLUE,
    },
    smallBox1: {
        backgroundColor: MAINCOLOR,
        borderBottomWidth: 2,
        borderColor: MAINCOLOR,
        padding: 10,
        width: "50%",
    },
    smallBox2: {
        backgroundColor: BLUEGLAY,
        width: "50%",
        borderBottomWidth: 2,
        borderColor: MAINCOLOR,
        padding: 10,
    },
    smallBox3: {
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderBottomWidth: 2,
        borderColor: MAINCOLOR,
        backgroundColor: CORNBLUE,
        width: "100%",
    },
    timeDate: {
        color: "white",
        textAlign: "left",
        fontSize: 15,
    },
    txtAttached: {
        color: "white",
        textAlign: "center",
        fontSize: 13,
    },
    attachedFile: {
        width: 80,
        borderRadius: 13,
        backgroundColor: CORNBLUE,
        padding: 3,
        marginBottom: 5,
        marginTop: 10,
    },
    txtTitle: {
        color: "white",
        textAlign: "left",
        fontSize: 20,
        marginVertical: 10,
        paddingLeft: 15,
        paddingRight: 10,
    },
    txtPlace: {
        color: "#222028",
        textAlign: "left",
        fontSize: 15,
    },
    txtWriter: {
        color: MAINCOLOR,
        textAlign: "right",
        fontSize: 15,
        marginTop: 10,
    },
    timeLabel: {
        color: "white",
        textAlign: "left",
        fontSize: 20,
    },

    calendarContainer: {
        flex: 1,
        // height:100,
        backgroundColor: "white",
        // backgroundColor:'violet'
    },
    plannerContainer: {
        // height:100,
        flexDirection: "column",
        // backgroundColor:'red',
    },
    lunchContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    lunchBox: {
        minHeight: 100,
        minWidth: "80%",
    },
    dinnerContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    titleBox: {
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center",
    },
    menuDinnerBox: {
        backgroundColor: MAINCOLOR,
        justifyContent: "center",
        borderRadius: 20,
    },
    menuLunchBox: {
        borderWidth: 1,
        borderColor: MAINCOLOR,
        justifyContent: "center",
        borderRadius: 20,
        marginVertical: 10,
        borderWidth: 2,
    },
    dinnerBox: {
        minHeight: 100,
        minWidth: "80%",
    },
    EmptyPlannerContainer: {
        // backgroundColor:'blue',
        height: 300,
        // marginTop:20,
        alignContent: "center",
        justifyContent: "center",
    },

    EmptyTitleBox: {
        // backgroundColor:'green',
        alignSelf: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: MAINCOLOR,
        paddingTop: 10,
        borderRadius: 30,
    },
    EmptyMenuBox: {
        // backgroundColor:'green',
        backgroundColor: MAINCOLOR,
        width: "80%",
        height: height * 0.1,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    PlanContainer: {
        // backgroundColor:'green',
        // marginTop: 30,
        marginVertical: 10,
    },
    NoticeContainer: {
        // backgroundColor:'blue',
        width: "98%",
        alignSelf: "center",
        // paddingVertical:10,
        // paddingHorizontal:20,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: MAINCOLOR,
        borderRadius: 25,
    },

    NoticeContainer2: {
        padding: 10,
        borderRadius: 20,
        paddingVertical: 10,
        marginBottom: 10,
        // backgroundColor:'blue',
        // paddingHorizontal:20,
        // borderWidth:3,
        // borderColor:MAINCOLOR,
    },
    PlannerTime: {
        backgroundColor: "green",
        width: "50%",
        height: "200px",
    },
})
