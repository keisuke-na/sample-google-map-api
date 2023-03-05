let map;
let geocoder;
let marker;
let mapService;
let streetViewService;
const zoomInLevel = 1;
const zoomOutLevel = 1;
const uluru = { lat: -25.344, lng: 131.031 };
const tokyo = { lat: 35.697456, lng: 139.702148 };
function initMap() {
  // The location of Uluru
  // The map, centered at Uluru
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: uluru,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    gestureHandling: "greedy",
    disableDoubleClickZoom: true,
    clickableIcons: false,
  });
  geocoder = new google.maps.Geocoder();
  mapService = new google.maps.places.PlacesService(map);
  streetViewService = new google.maps.StreetViewService();
  marker = new google.maps.Marker({ map });

  const inputText = document.createElement("input");

  inputText.type = "text";
  inputText.placeholder = "Enter a location";

  const submitButton = document.createElement("input");

  submitButton.type = "button";
  submitButton.value = "Geocode";
  submitButton.classList.add("button", "button-promary");

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputText);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitButton);

  let pressTimer;
  let isDragging;
  const pressDuration = 300;
  map.addListener("mousedown", function (e) {
    isDragging = false;
    pressTimer = window.setTimeout(function () {
      if (!isDragging) {
        marker.setPosition(e.latLng.toJSON());
        getPanorama({ location: e.latLng.toJSON(), radius: 50 });
        getPhoneNumberFromLatLng(e.latLng.toJSON(), function (result, status) {
          if (status === "OK") {
            console.log("result in getPhoneNumberFromLatLng : ", result.name);
            document.getElementById("map-infomation").innerText = result.name;
          } else {
            console.log("value is not found");
          }
        });
      }
    }, pressDuration);
  });

  map.addListener("dragstart", function () {
    isDragging = true;
  });

  map.addListener("mouseup", function () {
    clearTimeout(pressTimer);
  });

  map.addListener("click", function (e) {
    getPhoneNumberFromLatLng(e.latLng.toJSON(), function (result, status) {
      if (status === "OK") {
        console.log("result in getPhoneNumberFromLatLng : ", result.name);
      } else {
        console.log("value is not found");
      }
    });
  });

  //   marker.addListener("click", function (e) {
  //     getPanorama({ location: e.latLng.toJSON(), radius: 50 });
  //   });

  submitButton.addEventListener("click", () => {
    geocode({ address: inputText.value });
  });
}

async function getPhoneNumberFromLatLng(latLng, callback) {
  const placeId = await getPlaceId({ latLng: latLng });

  const request = {
    placeId: placeId,
    radius: "500",
    fields: ["name"],
  };

  mapService.getDetails(request, function (result, status) {
    callback(result, status);
  });
}

function geocode(request) {
  geocoder
    .geocode(request)
    .then((result) => {
      const { results } = result;

      map.setZoom(15);
      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((e) => {
      alert("Geocode was not suvvessful for the following reason: " + e);
    });
}

async function getPlaceId(request) {
  const { results } = await geocoder.geocode(request);
  return results[0].place_id;
}

function getPanorama(request) {
  streetViewService.getPanorama(request, function (data, status) {
    if (status === "OK") {
      const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("street-view"),
        {
          position: data.location.latLng,
          pov: {
            heading: 34,
            pitch: 10,
          },
          motionTracking: false,
        }
      );
    } else {
      console.log("Street view request failed: " + status);
    }
  });
}

function setTokyo() {
  map.setCenter(tokyo);
}

function zoomIn() {
  map.setZoom(map.getZoom() + zoomInLevel);
}

function zoomOut() {
  map.setZoom(map.getZoom() - zoomOutLevel);
}
