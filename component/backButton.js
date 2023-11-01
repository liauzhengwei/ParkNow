//when inside more details button page
import {StyleSheet,Pressable,Text,View} from 'react-native';

export default function BackButton({label}) {
    return (
        <View style={styles.container}>
            <Pressable onPress={()=>alert('button pressed')} style={styles.BackButtonContainer}>
                <Text style={styles.label}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0a0a0a',
        height: 50,
        width:100,
        padding: 10,
        margin: 10,
        borderRadius: 5,
        borderWidth:3,
        borderColor:'#666e6a',
    },
    label: {
        color: 'white',
        fontWeight: 'semibold',
        fontSize: 16,
        paddingBottom:3,
        
    },
    BackButtonContainer: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        
      },
});
