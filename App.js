import React, { createRef, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, TouchableOpacity,Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
//import * as Location from "expo-location";
//import BackButton from '"C://Users//ZW//Documents//GitHub//ParkNow//component//backButton.js"';
//import DetailsButton from './components/moreDetailsButton';
//import NavigateButton from './components/navigateButton';

markerList = [
  {
    coordinate: {
      latitude: 1.3452007715119019,
      longitude: 103.68086991160779,
    },
    chargingSpotName: "NTU Carpark A",
    chargingSpotAddress: "50 Nanyang Ave, Block N3.1, Singapore, 639798",
  },
  {
    coordinate: {
      latitude: 1.3438398751594671,
      longitude: 103.68593367297621,
    },
    chargingSpotName: "NTU Hall of Residence 4",
    chargingSpotAddress: "11 Nanyang Circle, Singapore 639779",
  },
];
export default function App() {
  const _map = createRef();
  const _search = createRef();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showMarkerOverlay, setShowMarkerOverlay] = useState(false);
  const [showMoreDetailsOverlay, setShowMoreDetailsOverlay] = useState(false);

  const MarkerOverlay = ({ marker,onClose}) =>{
    return(
        <View style={styles.markerOverlay}>
          <Text style={{fontSize:18,fontWeight:"bold",marginLeft:5}}>"carpark name"</Text> 
          <Text></Text>

          <TouchableOpacity onPress={toggleMoreDetailsOverlay}>
            <Text style={{fontSize:18,fontWeight:"bold",marginLeft:5}}>More Details</Text>
          </TouchableOpacity>
        </View>
        );
    };
    
  const toggleMoreDetailsOverlay = () => {
    setShowMoreDetailsOverlay(!showMoreDetailsOverlay);
  };

  const MoreDetailsOverlay = ({ marker,onClose}) =>{
    return(
      <View style={styles.markerOverlay}>
        <Text style={{fontSize:30,fontWeight:"bold"}}>"carpark name"</Text>
        <Text></Text>
        <Text style={{fontSize:18,fontWeight:"bold"}}>Address:</Text> 
        <Text></Text>
        <Text style={{fontSize:18,fontWeight:"bold"}}>Available Lots:</Text>
        <Text></Text>
        <Text style={{fontSize:18,fontWeight:"bold"}}>Car Park Rate:</Text>  
        
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={30} color="gray" />
        </TouchableOpacity>  
      </View>
    );
  };
    

  const [mapCamera, setMapCamera] = useState({
    center: {
      latitude: 1.3483,
      longitude: 103.6831,
    },
    zoom: 17,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 1,
        },
        (location) => {
          setMapCamera({
            center: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            zoom: 17,
          });
        }
      );
    })();
  }, []);

  useEffect(() => {
    _map.current.setCamera(mapCamera);
  }, [mapCamera]);

  const goToCurrentLoc = () => {
    return (
      <View style={styles.myLocationView}>
        <TouchableOpacity onPress={getCurrentLocation}>
          <MaterialIcons name="my-location" size={40} color="gray" />
        </TouchableOpacity>
      </View>
    );
  };

  const getCurrentLocation = () => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const location = await Location.getLastKnownPositionAsync({});
      setMapCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 17,
      });
    })();
  };

  const onMapPress = (e) => {
    _search.current.blur();
    setShowMarkerOverlay(false);
    setSelectedMarker(null);
  };

  const searchBar = () => {
    return (
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          color="gray"
          size={20}
          style={{ paddingVertical: 10, paddingRight: 5 }}
        />
        <GooglePlacesAutocomplete
          ref={_search}
          styles={{
            textInput: { height: 40 },
            listView: {
              borderRadius: 5,
            },
            row: {
              backgroundColor: "#FFFFFF",
              padding: 13,
              flexDirection: "row",
            },
          }}
          placeholder="Search"
          fetchDetails={true}
          onPress={(data, details = null) => {
            setMapCamera({
              center: {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              },
              zoom: 17,
            });
          }}
          query={{
            key: "AIzaSyBQL52pAibHVsZ1Dn-MHQVOFxNWBRBwIbI",
            language: "en",
            components: "country:sgp",
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="gray" />
      {searchBar()}
      {goToCurrentLoc()}
      <MapView
        ref={_map}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={onMapPress}
      >
        {markerList.map((marker, index) => {
          return (
            <Marker
              identifier={index.toString()}
              key={index.toString()}
              coordinate={marker.coordinate}
              onPress = {()=>{
                setSelectedMarker(marker);
                setShowMarkerOverlay(true)}}
            />
          );
        })}
        </MapView>
        {setShowMarkerOverlay && selectedMarker && (
          <MarkerOverlay
            marker={selectedMarker}
          />
        )}
        {showMoreDetailsOverlay && selectedMarker &&(<MoreDetailsOverlay onClose={toggleMoreDetailsOverlay} />)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    zIndex: -1,
    width: "100%",
    height: "100%",
  },
  myLocationView: {
    alignItems: "flex-end",
    position: "absolute",
    bottom: 8.0,
    right: 8.0,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray",
  },
  searchBar: {
    position: "absolute",
    left: 0.0,
    right: 0.0,
    top: 0.0,
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 10,
  },
  markerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius:20,
    elevation:5,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset:{ width:0,height:-3},
  },
});
