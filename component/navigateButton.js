import {StyleSheet,Pressable,Text,View} from 'react-native';

export default function NavigateButton({label}) {
    return (
        <View style={styles.container}>
            <Pressable onPress={()=>alert('button pressed')} style={styles.NavigateContainer}>
                <Text style={styles.label}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0da154',
        height: 50,
        width:100,
        padding: 10,
        margin: 10,
        borderRadius: 5,
        borderWidth:3,
        borderColor:'#1efa88',
        borderTopWidth:2,
        borderBottomWidth:4,
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        paddingBottom:5,
    },
    NavigateContainer: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
});


