import {StyleSheet,Pressable,Text,View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import React from 'react';

export default function DetailsButton (){
    return (
        <View style={styles.container}>
            <Pressable onPress={()=>alert('button pressed')} style={styles.DetailsContainer}>
                <Feather name="more-vertical" size = {30} color = "black" style={styles.icon}/>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: 40,
        width:20,
        padding: 10,
        margin: 10,
    },
    icon:{
        height: 30,
        width:30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    DetailsContainer: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
});