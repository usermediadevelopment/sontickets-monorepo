import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
const containerStyle = {
  width: "100%",
  height: "200px",
};

type GoogleMapComponentProps = {
  latLng: {
    lat: number;
    lng: number;
  };
};
const GoogleMapComponent = ({ latLng }: GoogleMapComponentProps) => {
  return (
    <LoadScript googleMapsApiKey="AIzaSyDLy8EfZsZTcMbvN9FOPQ4fW8k56sDk5bc">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={latLng}
        zoom={18}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker position={latLng} />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
