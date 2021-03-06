import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, Image, FlatList } from "react-native";
import { Button, colors } from "react-native-elements";
import advertisingImageApi from "../../api/http/resource/advertisingImageApi";
import FeatureCard from "../../components/cards/FeatureCard";
import ExpandingDotPager from "../../components/pager/ExpandingDotPager";
import { AuthContext } from "../../navigation";
import routes from "../../utils/enum/routes";
import storageKeys from "../../utils/enum/storageKeys";
import env from "../../utils/env";
import { styles } from "./HomeScreen.styles";
import AdvertisementCard from "../../components/cards/AdvertisementCard";
import universityApi from "../../api/http/resource/universityApi";
import NetInfo from "@react-native-community/netinfo";
import typeOfResource from "../../utils/enum/resource/TypeOfResource";
import ResourceCard from "../../components/cards/ResourceCard";
const HomeScreen = ({ navigation }) => {
  const [advertisingImages, setAdvertisingImages] = useState([]);
  const [outstandingUniversities, setOutstandingUniversities] = useState({
    universities: [],
    page: 0,
    size: 5,
    hasNext: true,
  });
 
  useEffect(async () => {
    try {
      const images = await AsyncStorage.getItem(storageKeys.ADVERTISING_IMAGES);
      if (images) setAdvertisingImages(JSON.parse(images));
      else {
        const res = await advertisingImageApi.getAdvertisingImages();
        AsyncStorage.setItem(
          storageKeys.ADVERTISING_IMAGES,
          JSON.stringify(res)
        );
        setAdvertisingImages(res);
      }
    } catch (e) {
      console.log(e);
    }
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        fetchUniversities();
      }
    });
    return unsubscribe;
  }, []);
  const fetchUniversities = async () => {
    try {
      if (outstandingUniversities.universities.length < 5) {
        const { universities, page, size, hasNext } = outstandingUniversities;
        const res = await universityApi.getUniversityList({
          page: page,
          size: size,
          sortBy: "viewNumber",
          keyword: "",
        });
        setOutstandingUniversities({
          universities: res.items,
          page: res.nextPage,
          size: size,
          hasNext: res.hasNext,
        });
        console.log(outstandingUniversities.universities);
      }
    } catch (e) {
      console.log("error ", e);
    }
  };

  const onPressMoreUniversity = () => {
    navigation.navigate(routes.UNIVERSITY);
  };
  const renderUniversity = (university) => (
    <AdvertisementCard
      resource={university.item}
      typeOfResource={typeOfResource.UNIVERSITY}
    />
  );
  return (
    <ScrollView style={styles.container}>
      <ExpandingDotPager style={styles.pager}>
        {advertisingImages.map((item, index) => (
          <Image source={{ uri: item.uri }} key={index} />
        ))}
      </ExpandingDotPager>
      <Text style={styles.text}>H??y ch???n t??nh n??ng b???n mu???n kh??m ph??</Text>
      <View style={styles.features}>
        <FeatureCard
          icon="lightbulb"
          title="Hi???u m??nh"
          onPress={() => navigation.navigate(routes.CAREER_TEST)}
        />
        <FeatureCard
          icon="book-open"
          title="Hi???u ng??nh"
          onPress={() => navigation.navigate(routes.MAJOR)}
        />
        <FeatureCard
          icon="school"
          title="Hi???u tr?????ng"
          onPress={() => navigation.navigate(routes.UNIVERSITY)}
        />
        <FeatureCard
          icon="comments"
          title="T?? v???n"
          onPress={() => navigation.navigate(routes.CHAT)}
        />
      </View>

      <View style={{ marginTop: 10 }}>
        <View style={styles.bottomContainer}>
          <Text style={styles.universitiesTitle}>C??c tr?????ng ?????i h???c</Text>
          <Button
            title="Xem th??m"
            type="outline"
            buttonStyle={styles.moreButton}
            titleStyle={styles.moreTitle}
            containerStyle={styles.moreContainer}
            onPress={onPressMoreUniversity}
          />
        </View>
      </View>
      <FlatList
        horizontal
        data={outstandingUniversities.universities}
        renderItem={renderUniversity}
        keyExtractor={(item) => item._id}
      />
    </ScrollView>
  );
};

export default HomeScreen;
