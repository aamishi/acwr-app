import React, { useLayoutEffect, useState, useRef} from 'react';
import { StyleSheet, Pressable, Text, View, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Dimensions, ScrollView} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from "@react-navigation/elements";
import Slider from '@react-native-community/slider';
import CircleSlider from "react-native-circle-slider";
//import DatePicker from 'react-native-date-picker'

import {db} from "./Firebase";
import {collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 


function report({navigation, route}) {
    var goalVar = ''
    const [slide, onSlide] = React.useState(5);
    const [time, onChangeTime] = React.useState(0);
    const [displayACWR, onChangeACWR] = React.useState(Math.round(global.data.acwr[global.data.acwr.length - 1] * 100) / 100);
    
    //const [date, setDate] = useState(new Date())
    //const [open, setOpen] = useState(false)

    useLayoutEffect(() => {
       navigation.setOptions({
           headerRight:()=> (
               <AntDesign name = "logout" size = {24}
                color = 'black'/>
           )
       })
    })

    const showDate = () =>{
        if (route.params == null){
            const day = new Date()
            return day.getFullYear()+'/'+(day.getMonth()+1)+'/'+day.getDate()
        }
        console.log(route.params)
        const day  = route.params.date;
        console.log(day)
        
        return day
    }

    const submit = () =>{
        //setDoc(doc(db, "cities", "new-city-id"), data);
        //db.collection('users').a
        setDoc(doc(db, "users", 'joe'), {
            name: "Tokyo",
            country: "Japan"
        });
      //console.log("Document written with ID: ", docRef.id);
        /*db.collection("users").doc("LA").set({
            name: "Los Angeles",
            //state: "CA",
            //country: "USA"
        })
        .then(() => {
            console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });*/
    }

    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@storage_Key')
            jsonValue != null ? JSON.parse(jsonValue) : null;

            //console.log(jsonValue)
            //data = jsonValue

            global.data.acute = JSON.parse(jsonValue).acute
            global.data.chronic = JSON.parse(jsonValue).chronic
            //data.daily = JSON.parse(jsonValue).daily

            global.data.date = JSON.parse(jsonValue).date
            global.data.fullDate = JSON.parse(jsonValue).fullDate
            global.data.time = JSON.parse(jsonValue).time
            global.data.percieved = JSON.parse(jsonValue).percieved
            global.data.acwr = JSON.parse(jsonValue).acwr
            //global.data.desc = JSON.parse(jsonValue).desc
            //global.data.com = JSON.parse(jsonValue).com
            //global.data.goals = JSON.parse(jsonValue).goals
            onChangeACWR(Math.round(global.data.acwr[global.data.acwr.length - 1] * 100) / 100)
            //console.log(global.data)
            
            //updateDaily()
            //updateData()
            //storeData({time: [], acute:[], chronic :[], date:[], percieved: [], acwr:[]})
            //storeData(data)
            //console.log(data)
            //storeData({daily: [], acute:[], chronic :[]})
        } catch(e) {
          // error reading value
        }
    }

    const editDate = () =>{
        /*if (global.data.date.indexOf(showDate()) == -1){
            updateData()
        } else {

        }*/
        console.log(global.data.date.indexOf(showDate()))
        if (global.data.date.indexOf(showDate()) == -1){
        
        } else{
            goalVar = global.data.goals[global.data.date.indexOf(showDate())]
            console.log(goalVar)
        }
    }
    editDate()
    const [desc, onChangeDesc] = React.useState('What did I do today...');
    const [comm, onChangeComm] = React.useState('What did I notice...');
    const [goal, onChangeGoal] = React.useState(goalVar + 'dfa');
    
    const updateData = () => {
        //const acwrPast = data.acwr[data.acwr.length]
        //console.log(data.date.length)
        var acutePast = global.data.acute[global.data.acute.length - 1]
        var chronicPast = global.data.chronic[global.data.chronic.length - 1]
        var current = time * slide
        var acwrNew = 0
        var acuteNew = 0
        var chronicNew = 0

        if (global.data.date.length === 0){
            acwrNew = 1
            acuteNew = current
            chronicNew = current
        }
        else{
            acuteNew = (current * 0.25) + (0.75 * acutePast) 
            chronicNew = current * (2/22) + (1 - 2/22) * chronicPast
            acwrNew = acuteNew/chronicNew
        }

        //global.data.date.push(new Date())
        const nowDate = new Date();
        const pastDate = new Date(global.data.fullDate[global.data.fullDate.length - 1])
        const Difference_In_Time = nowDate.getTime() - pastDate.getTime();
        const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        console.log(Difference_In_Days)

        if (Math.round(Difference_In_Days) > 0) {
            console.log('if')
            for (let i = 0; i < Difference_In_Days; i++) {
                acuteNew = (0 * 0.25) + (0.75 * acutePast) 
                chronicNew = 0 * (2/22) + (1 - 2/22) * chronicPast
                acwrNew = acuteNew/chronicNew
                global.data.acute.push(acuteNew)
                global.data.chronic.push(chronicNew)
                global.data.acwr.push(acwrNew)
                global.data.time.push(0)
                global.data.percieved.push(0)
                global.data.desc.push(null)
                global.data.com.push(null)
                global.data.goals.push(null)
            }
            global.data.fullDate.push(...getDaysArray(nowDate, pastDate))
            global.data.date.push(...getDaysArrayShort(nowDate, pastDate))
        }
        else{
            console.log('else')
            global.data.date.push(nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate())
            global.data.fullDate.push(nowDate)
            global.data.acute.push(acuteNew)
            global.data.time.push(time)
            global.data.chronic.push(chronicNew)
            global.data.percieved.push(slide)
            global.data.acwr.push(acwrNew)
            global.data.desc.push(desc)
            global.data.com.push(comm)
            global.data.goals.push(goal)
        }
        storeData(global.data)
    }

    const storeData = async (value) => {
        try {
          const jsonValue = JSON.stringify(value)
          await AsyncStorage.setItem('@storage_Key', jsonValue)
          //console.log(new Date())
          //console.log(jsonValue)
        } catch (e) {
          // saving error
        }
        getData()
    }

    var getDaysArray = function(start, end) {
        for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
            arr.push(new Date(dt));
        }
        return arr;
    };

    var getDaysArrayShort = function(start, end) {
        for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
            const nowDate = new Date(dt)
            arr.push(nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate())
        }
        return arr;
    };

    /*const updateDaily = () => {
        const len = data.daily.length
        if (len == 0 ) {
            data.daily.push([{
                date: new Date(),
                value: slide*time
            }])
        }
        else{
            const week = data.daily[len-1]
            //console.log(week)
            if (week.length < 7) {
                data.daily[len-1].push({
                    date: new Date(), 
                    value: slide*time})
            }
            else{
                updateAcute(data.daily[len-1])
                data.daily.push([{
                    date: new Date(), 
                    value: slide*time
                }])
            }
        }
    }*/

    /*const updateAcute = (array) => {
        //const sum = array.reduce((partialSum, a) => partialSum + a, 0);
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += array[i].value;
        }
        
        const len = data.acute.length
        if (len == 0 ) {
            data.acute.push([{
                date: new Date(), 
                value: sum/7
            }])
        }
        else{
            const week = data.acute[len-1]
            //console.log(week)
            if (week.length < 4) {
                data.acute[len-1].push(
                    {
                        date: new Date(), 
                        value: sum/7
                    } 
                    )
            }
            else{
                updateChronic(data.acute[len-1])
                data.acute.push([
                    {
                        date: new Date(), 
                        value: sum/7
                    } 
                ])
            }
        }
        //data.acute.push(sum/7)
    }*/

    /*const updateChronic = (array) => {
        //const sum = array.reduce((partialSum, a) => partialSum + a, 0);
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += array[i].value;
        }
        data.chronic.push(sum/4)
    }*/

    return (
        <SafeAreaView style={[styles.container, {flexDirection: "column"}]}>
            {/*<DatePicker date={date} onDateChange={setDate} />*/}
            <KeyboardAvoidingView
            keyboardVerticalOffset = {100}
            behavior='position'
            //behavior={Platform.OS === "ios" ? "padding" : "height"}
            //style={styles.container}
            style={{flexDirection: "column", alignItems: 'center'}}
            >
                <TouchableWithoutFeedback
                   onPress={Keyboard.dismiss}
                >
                    <View  style={{flex: 1}}>
                        <View style={{ flex: 4}}>
                            <View style={[{flex: 1, flexDirection: "row", justifyContent: "space-around"}]}>
                                {/*<Text style = {[styles.text]}>
                                    Current Status: {Math.round(data.acwr[data.acwr.length - 1] * 100) / 100}
    </Text>*/}
                                <Text style = {[styles.text]}>
                                                                Current Status: {displayACWR}
                                </Text>
                                <Text style = {[styles.text]}>
                                    Weekly Target: 1.2
                                </Text>
                            </View>
                            <View style={{flex: 8, alignItems: 'center'}}>
                                {/*<Text style = {[styles.text]}>
                                    Up Next?: Competiton Tuesday 
                                </Text>*/}
                                <Text style = {[styles.text]}>
                                    {Math.round((slide+Number.EPSILON)*100)/100} 
                                </Text>
                                <Slider
                                    style={{width: 200}}
                                    minimumValue={1}
                                    maximumValue={10}
                                    step = {1}
                                    value = {5.5}
                                    minimumTrackTintColor="red"
                                    maximumTrackTintColor="limegreen"
                                    onValueChange={onSlide}
                                    tapToSeek
                                    //thumbTintColor = 'dodgerblue'
                                />
                                <Text style = {[styles.text]}>
                                    {time} 
                                </Text>
                                <CircleSlider
                                    dialRadius={60}
                                    btnRadius={25}
                                    textSize={1}
                                    strokeWidth={5}
                                    meterColor={'dodgerblue'}
                                    strokeColor={'#e1e1e1'}
                                    onValueChange={onChangeTime}
                                    //value = {onChangeTime}
                                    //onValueChange = {time}
                                    //value = {time}
                                    max = {360} 
                                />
                            </View>
                        </View>
                        <View style={{flex: 5, flexDirection: "column",
                                            justifyContent:'space-evenly',
                                            paddingHorizontal: 10}}>
                                    <Text style = {[styles.boxtitle]}>
                                        Description 
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        //multiline = {true}
                                        //numberOfLines={3}
                                        onChangeText={onChangeDesc}
                                        value={desc}
                                        //maxLength={5}
                                        //clearButtonMode={true}
                                        //placeholderTextColor='red'
                                    />       
                                    <Text>
                                        Comments
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={onChangeComm}
                                        value={comm}
                                        clearButtonMode={true}
                                    />       
                                    <Text>
                                        Goals
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={onChangeGoal}
                                        value={goal}
                                        clearButtonMode={true}
                                        //keyboardType='numeric'
                                    />     
                            </View>
                        <View style={{ flex: 0.5, justifyContent:"flex-end"}}>
                            <View style={{ flex:1, flexDirection:'row'}}>
                            <TouchableOpacity
                                style={[{ opacity: 1 }, {backgroundColor: 'blue', height:40, flex:1}]}
                                    //onPress={() => {
                                    //    setModalVisible(true)     
                                    //    }}
                                //onPress = {submit}
                                onPress = {
                                    () => updateData()
                                }
                                //onPress = {() => storeData({acute:[slide], chronic: []})}

                            >
                                {/*<MaterialIcons name='access-time' size={50} color='orange'></MaterialIcons>*/}
                                <Text style = {[styles.buttonText]}>
                                    Submit
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[{ opacity: 1 }, {backgroundColor: 'dodgerblue', height:40, flex:1}]}
                                onPress={() => setOpen(true)}
                            >
                                <Text style = {[styles.buttonText]}>
                                    {showDate()}
                                </Text>
                            </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
        //alignItems: 'center',
        //justifyContent: 'center',
    },
    buttonText:{
        color:'white',
        fontSize: 25,
        textAlign: 'center',
        margin:5
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    text:{
        margin:5,
        //padding:5,
        //paddingLeft:5,
        fontSize: 15,
        fontFamily:'Helvetica',
        textAlign: 'center'
        //color:'white'
    },
    input:{
        paddingTop:5,
        paddingLeft:5,
        marginBottom: 20,
        fontSize: 15,
        borderWidth:1,
        fontFamily:'Helvetica',
        height:50
        //color:'white'
    },
    boxtitle:{
        marginTop: 10
    },    
    button: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "deeppink",
        margin: 5,
        padding:5,
        alignSelf: 'stretch'
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    item: {
        flex: 1,
        marginHorizontal: 10,
        //marginTop: 5,
        padding: 15,
        //backgroundColor: 'slateblue',
        //fontSize: 50,
        borderBottomColor:"grey",
        borderBottomWidth:0.5,
        alignItems: "center",
        justifyContent: "center"
    },
    profileIcon: {
        marginRight: 25,
        marginLeft: 25,
        marginTop: 5,
        marginBottom: 5,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: 'white',
        //borderRadius:10,
        //borderWidth: 1,
        //borderColor: '#fff'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        //flexDirection: 'row'
    },
    docIcon: {
        //marginRight:5,
        //marginLeft: 5,
        marginTop: 24,
        //marginBottom:5,
        paddingTop: 15,
        //paddingBottom:5,
        backgroundColor: 'white',
        //borderRadius:10,
        //borderWidth: 1,
        //borderColor: '#fff'
    },
    fileIcon: {
        marginRight: 25,
        marginLeft: 25,
        marginTop: 5,
        marginBottom: 5,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: 'white',
        //borderRadius:10,
        //borderWidth: 1,
        //borderColor: '#fff'
    },
    titleText: {
        fontSize: 14,
        lineHeight: 24,
        fontWeight: "bold"
      },
    box: {
        height: 150,
        width: 150,
        backgroundColor: "blue",
        borderRadius: 5
    }
});

export default report;