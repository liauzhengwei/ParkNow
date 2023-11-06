import React, { createRef, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Linking,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import Feather from "react-native-vector-icons/Feather";
import Foundation from "react-native-vector-icons/Foundation";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "./lib/supabase";

export default function App() {
  const _map = createRef();
  const _search = createRef();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
  const [showMarkerOverlay, setShowMarkerOverlay] = useState(false);
  const [showMoreDetailsOverlay, setShowMoreDetailsOverlay] = useState(false);
  const [showNavigateOverlay, setShowNavigateOverlay] = useState(false);
  const [showBlurOverlay, setShowBlurOverlay] = useState(false);
  const [markerList, setMarkerList] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState("00:00");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [estimatedDrivingTime, setEstimatedDrivingTime] = useState(null);
  const [carparkAvailabilityData, setCarparkAvailabilityData] = useState(null);
  const [mapCamera, setMapCamera] = useState({
    center: {
      latitude: 1.3483,
      longitude: 103.6831,
    },
    zoom: 17,
  });

  // Function to handle interval selection
  const handleIntervalChange = (value) => {
    setSelectedInterval(value);
  };

  const CarparkFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("hdb_carpark_data")
        .select("*");

      if (error) {
        console.error("Error retrieving data from Supabase:", error);
        return [];
      }

      // Transform the data into the desired format
      const markerList = data.map((row) => ({
        carParkNo: row.car_park_no,
        coordinate: {
          latitude: row.latitude,
          longitude: row.longitude,
        },
        carParkName: row.address,
        carParkAddress: row.address,
        carParkCost: row.parking_cost_per_min,
      }));

      return markerList;
    } catch (error) {
      console.error("An error occurred:", error);
      return [];
    }
  };

  const TimeIntervalSelector = () => {
    return (
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: 18, marginRight: 20, marginTop: 15 }}>
          Parking Time
        </Text>
        <Picker
          style={{ width: 125, height: 55, top: 0, backgroundColor: "#ebebeb" }}
          selectedValue={selectedInterval}
          onValueChange={handleIntervalChange}
        >
          {Array.from({ length: 24 * 4 }, (_, i) => {
            const hour = Math.floor(i / 4);
            const minute = (i % 4) * 15;
            const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
              .toString()
              .padStart(2, "0")}`;
            return (
              <Picker.Item
                key={formattedTime}
                label={formattedTime}
                value={formattedTime}
              />
            );
          })}
        </Picker>
      </View>
    );
  };

  const MarkerOverlay = ({ marker, onClose }) => {
    function calculateCost(carParkCostString, timeInterval) {
      const regex = /\$([0-9.]+)/g;
      const matches = carParkCostString.match(regex);

      if (matches && matches.length === 2) {
        const weekdayCost = parseFloat(matches[0].replace("$", ""));
        const weekendCost = parseFloat(matches[1].replace("$", ""));

        // Create a Date object for a specific date (e.g., today's date)
        const currentDate = new Date();

        // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
        const dayOfWeek = currentDate.getDay();

        // Check if it's a weekday (Monday to Friday)
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

        const rate = isWeekday ? weekdayCost : weekendCost;
        // console.log(rate);
        // Split the timeInterval into hours and minutes
        const [hours, minutes] = timeInterval.split(":").map(Number);

        //console.log(hours, minutes);
        // Calculate the cost
        const cost = (hours * 60 + minutes) * rate;

        return cost.toFixed(2);
      } else {
        return "Invalid data";
      }
    }
    const calculatedCost = calculateCost(marker.carParkCost, selectedInterval);

    return (
      <View style={styles.markerOverlay}>
        <Text
          style={{
            fontSize: 23,
            fontWeight: "bold",
            marginLeft: 5,
            top: 3,
            marginRight: 35,
          }}
        >
          {marker.carParkName}
        </Text>
        <Text></Text>
        <View style={styles.row}>
          <Ionicons
            name="location-sharp"
            size={25} // Adjust the size of the icon as needed
            color="black" // Set the icon color
            marginRight={12}
            marginLeft={5}
          />
          <Text style={{ fontSize: 18 }}>{marker.carParkAddress}</Text>
        </View>
        <Text></Text>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            size={25} // Adjust the size of the icon as needed
            color="black" // Set the icon color
            marginRight={12}
            marginLeft={5}
          />
          <Text style={{ fontSize: 18 }}>
            Estimated Driving Time: {estimatedDrivingTime} min
          </Text>
        </View>
        <Text></Text>
        <View style={styles.row}>
          <FontAwesome5
            name="car-side" // The name of the icon you want to use
            size={25} // Adjust the size of the icon as needed
            color="black" // Set the icon color
            marginRight={10}
            marginTop={15}
          />
          <TimeIntervalSelector />
        </View>
        <Text></Text>
        <View style={styles.row}>
          <Foundation
            name="dollar" // The name of the icon you want to use
            size={30} // Adjust the size of the icon as needed
            color="black"
            marginLeft={8} // Set the icon color
          />
          <Text style={{ fontSize: 18, paddingLeft: 20 }}>
            Estimated Parking
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={{ fontSize: 18, paddingLeft: 40 }}>Cost: $</Text>
          <Text style={{ fontSize: 18, paddingLeft: 10 }}>
            {calculatedCost}
          </Text>
        </View>
        <DetailsButton />
        <NavigateButton />
      </View>
    );
  };

  const DetailsButton = () => {
    return (
      <View style={styles.detailsContainer1}>
        <TouchableOpacity
          onPress={toggleMoreDetailsOverlay}
          style={styles.detailsContainer2}
        >
          <Feather
            name="more-vertical"
            size={30}
            color="black"
            style={styles.detailsIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const toggleMoreDetailsOverlay = () => {
    setShowMoreDetailsOverlay(true);
    setShowNavigateOverlay(false);
  };

  const MoreDetailsOverlay = ({ marker, onClose }) => {
    function formatCarParkCost(carParkCostString) {
      try {
        const regex = /\$([0-9.]+)/g;
        const matches = carParkCostString.match(regex);

        if (matches && matches.length === 2) {
          const weekdayCost = matches[0];
          const weekendCost = matches[1];

          return `Weekday: ${weekdayCost}/min\nWeekend: ${weekendCost}/min`;
        } else {
          return "Invalid data";
        }
      } catch (error) {
        console.error("Error formatting carParkCost data:", error);
        return "Invalid data";
      }
    }
    const formattedCost = formatCarParkCost(marker.carParkCost);

    return (
      <View style={styles.moreDetailsOverlay}>
        <Text style={{ fontSize: 30, fontWeight: "bold", top: 10 }}>
          {marker.carParkName}
        </Text>
        <Text></Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", paddingTop: 20 }}>
          Address: {marker.carParkAddress}
        </Text>
        <Text></Text>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Available Lots: {}
        </Text>
        <Text style={{ fontSize: 15 }}>
          {carparkAvailabilityData
            ? carparkAvailabilityData.lots_available +
              " / " +
              carparkAvailabilityData.total_lots
            : "Data unavailable"}
        </Text>
        <Text></Text>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Car Park Rate:</Text>
        <Text style={{ fontSize: 15 }}>{formattedCost}</Text>

        <BackButton />
      </View>
    );
  };

  const backToMarkerOverlay = () => {
    setCarparkAvailabilityData(null);
    setShowMoreDetailsOverlay(false);
    setShowNavigateOverlay(false);
    setShowMarkerOverlay(true);
    setShowBlurOverlay(false);
  };

  const BackButton = () => {
    return (
      <View style={styles.backButtonContainer1}>
        <TouchableOpacity
          onPress={backToMarkerOverlay}
          style={styles.backButtonContainer2}
        >
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const NavigateButton = () => {
    const openNavigateOverlay = () => {
      setShowNavigateOverlay(true);
      setShowBlurOverlay(true);
      console.log(carparkAvailabilityData);
    };

    return (
      <View style={styles.navigateContainer1}>
        <TouchableOpacity
          onPress={openNavigateOverlay}
          style={styles.navigateContainer2}
        >
          <Text style={styles.navigateLabel}>Navigate</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const CloseButton = ({ backToMarkerOverlay }) => {
    return (
      <View style={styles.xButtonContainer1}>
        <TouchableOpacity
          onPress={backToMarkerOverlay}
          style={styles.xButtonContainer2}
        >
          <Feather
            name="x"
            size={30}
            color="black"
            style={styles.closeButton}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const googleNavigation = () => {
    const lat = selectedMarker.coordinate.latitude;
    const long = selectedMarker.coordinate.longitude;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&travelmode=driving`;
    Linking.openURL(url);
  };

  const wazeNavigation = () => {
    const lat = selectedMarker.coordinate.latitude;
    const long = selectedMarker.coordinate.longitude;
    const url = `https://www.waze.com/ul?ll=${lat},${long}&navigate=yes&zoom=17`;
    Linking.openURL(url);
  };

  const NavigateOverlay = () => {
    return (
      <View style={styles.navigateOverlay}>
        <CloseButton backToMarkerOverlay={backToMarkerOverlay} />
        <Text style={{ fontSize: 20 }}>Open with:</Text>
        <Text></Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={googleNavigation}>
            <Image
              source={require("./assets/googleMapsIcon.png")}
              style={{ width: 75, height: 75, marginLeft: 30, marginTop: 15 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={wazeNavigation}>
            <Image
              source={require("./assets/wazeIcon.jpg")}
              style={{ width: 100, height: 100, marginTop: 8, marginLeft: 25 }}
            />
          </TouchableOpacity>
          <MaterialCommunityIcons
            name="dots-horizontal" // The name of the icon you want to use
            size={80} // Adjust the size of the icon as needed
            color="black" // Set the icon color
            marginTop={15}
            marginLeft={15}
          />
        </View>
      </View>
    );
  };

  const openNavigateOverlay = () => {
    setShowNavigateOverlay(true);
  };

  const BlurScreenOverlay = () => {
    return showBlurOverlay ? (
      <View style={styles.blurScreenOverlay}></View>
    ) : null;
  };

  // const updateCoords = async () => {
  //     const { data, error } = await supabase
  //       .from("hdb_carpark_data")
  //       .select("car_park_no, x_coord, y_coord")
  //       .like("car_park_no", "T%");
  //     console.log(data.length);
  //     for (let i = 0; i < data.length; i++) {
  //       const response = await fetch(
  //         `https://www.onemap.gov.sg/api/common/convert/3414to4326?X=${data[i].x_coord}&Y=${data[i].y_coord}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization:
  //               "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxOGJjN2M2NTYzNWUxMDRmMDI5YjQ4YTI1MjRlOTAzZiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Nlc3Npb24iLCJpYXQiOjE2OTkxOTE5NDAsImV4cCI6MTY5OTQ1MTE0MCwibmJmIjoxNjk5MTkxOTQwLCJqdGkiOiJCN1Rjc1J1NGxkS0ZMa3JwIiwidXNlcl9pZCI6Njc0LCJmb3JldmVyIjpmYWxzZX0.mcBGYgZEfg_IQgGnKuvaS9M9WEjM9CjryrBmLtxMd44",
  //           },
  //         }
  //       );
  //       const json = await response.json();
  //       console.log(i + ": ", json.latitude + ", ", json.longitude);
  //       const { error } = await supabase
  //         .from("hdb_carpark_data")
  //         .update({ latitude: json.latitude, longitude: json.longitude })
  //         .eq("car_park_no", data[i].car_park_no);
  //     }
  // };

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
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    })();
  }, []);

  useEffect(() => {
    const fetchMarkerList = async () => {
      const list = await CarparkFromSupabase();
      setMarkerList(list);
    };

    fetchMarkerList();
  }, []);

  useEffect(() => {
    _map.current.setCamera(mapCamera);
  }, [mapCamera]);

  useEffect(() => {
    if (selectedMarker) {
      const getCarparkAvailability = async (carparkNo) => {
        try {
          const response = await fetch(
            `https://api.data.gov.sg/v1/transport/carpark-availability`,
            {
              method: "GET",
              headers: {
                accept: "*/*",
              },
            }
          );
          const json = await response.json();
          const carparkData = json.items[0].carpark_data;
          for (let i = 0; i < carparkData.length; i++) {
            if (carparkData[i].carpark_number == carparkNo) {
              console.log("found");
              setCarparkAvailabilityData(carparkData[i].carpark_info[0]);
              return;
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      getCarparkAvailability(selectedMarker.carParkNo);
    }
  }, [selectedMarker]);

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
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  };

  const onMapPress = (e) => {
    _search.current.blur();
    setShowMarkerOverlay(false);
    setSelectedMarker(null);
    setSelectedMarkerIndex(null);
    setShowMoreDetailsOverlay(false);
    setShowNavigateOverlay(false);
  };

  const searchBar = () => {
    return (
      <View style={styles.searchBar}>
        <View styles={{ backgroundColor: "white" }}>
          <Ionicons
            name="search"
            color="gray"
            size={20}
            style={{
              backgroundColor: "white",
              paddingTop: 9,
              paddingBottom: 9,
            }}
          />
        </View>
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

  const isSelectedMarkerIndex = (index) => {
    return index == selectedMarkerIndex;
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="gray" />
      {searchBar()}
      {goToCurrentLoc()}
      <MapView
        ref={_map}
        style={styles.map}
        customMapStyle={mapStyle}
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
              anchor={{ x: 0.5, y: 1.05 }}
              onPress={() => {
                setSelectedMarker(marker);
                setSelectedMarkerIndex(index);
                setShowMarkerOverlay(true);
                setCarparkAvailabilityData(null);
                _map.current.animateCamera({
                  center: {
                    latitude: marker.coordinate.latitude,
                    longitude: marker.coordinate.longitude,
                  },
                  zoom: 17,
                });
              }}
            >
              <Image
                source={require("./assets/adaptive-icon.png")}
                style={
                  isSelectedMarkerIndex(index)
                    ? { height: 75, width: 50 }
                    : { height: 60, width: 50 }
                }
                // resizeMode="contain"
              />
            </Marker>
          );
        })}
        {selectedMarker && (
          <MapViewDirections
            origin={currentLocation}
            destination={selectedMarker.coordinate}
            apikey={"AIzaSyBQL52pAibHVsZ1Dn-MHQVOFxNWBRBwIbI"}
            strokeWidth={3}
            strokeColor="hotpink"
            onReady={(result) => {
              setEstimatedDrivingTime(Math.round(result.duration));
            }}
          />
        )}
      </MapView>
      <BlurScreenOverlay />
      {showMarkerOverlay && selectedMarker && (
        <MarkerOverlay marker={selectedMarker} />
      )}
      {showMoreDetailsOverlay && selectedMarker && (
        <MoreDetailsOverlay marker={selectedMarker} />
      )}
      {showNavigateOverlay && selectedMarker && (
        <NavigateOverlay marker={selectedMarker} />
      )}
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
    height: 325,
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
  },
  moreDetailsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    padding: 16,
    backgroundColor: "white",
  },
  detailsContainer1: {
    backgroundColor: "white",
    height: 40,
    width: 20,
    top: 15,
    right: 25,
    position: "absolute",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsIcon: {
    height: 30,
    width: 30,
  },
  detailsContainer2: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonContainer1: {
    backgroundColor: "#0a0a0a",
    height: 50,
    width: 100,
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: "#666e6a",
    bottom: 10,
    left: 10,
    position: "absolute",
    zIndex: 5,
  },
  backLabel: {
    color: "white",
    fontWeight: "semibold",
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 100,
    paddingTop: 13,
    paddingLeft: 32,
  },
  backButtonContainer2: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  navigateOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    height: 200,
    backgroundColor: "white",
    zIndex: 2,
  },
  navigateContainer1: {
    backgroundColor: "#0da154",
    height: 50,
    width: 100,
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: "#1efa88",
    bottom: 10,
    right: 10,
    position: "absolute",
    zIndex: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  navigateLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    height: 50,
    width: 100,
    paddingTop: 13,
    paddingLeft: 16,
  },
  navigateContainer2: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
  },
  closeButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  xButtonContainer1: {
    backgroundColor: "white",
    height: 40,
    width: 40,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 15,
    right: 15,
    zIndex: 5,
  },
  xButtonContainer2: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  blurScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
});

const mapStyle = [
  {
    featureType: "poi.business",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];
