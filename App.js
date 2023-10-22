import React, { createRef, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

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

  function goToCurrentLoc() {
    return (
      <View style={styles.myLocationView}>
        <TouchableOpacity onPress={getCurrentLocation}>
          <MaterialIcons name="my-location" size={40} color="gray" />
        </TouchableOpacity>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      {goToCurrentLoc()}
      <MapView
        ref={_map}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {markerList.map((marker, index) => {
          return (
            <Marker
              identifier={index.toString()}
              key={index.toString()}
              coordinate={marker.coordinate}
            />
          );
        })}
      </MapView>
      <StatusBar style="auto" />
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
    paddingTop: 100,
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
});
