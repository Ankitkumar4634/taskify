'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "?");

interface Contact {
  email: string | undefined;
  title: string | undefined;
  workLatitude: null;
  workLongitude: null;
  id: number;
  display_name: string;
  primary_email: string | string[] | null;
  secondary_email: string | string[] | null;
  home_phone: string | null;
  work_phone: string | null;
  mobile_number: string | null;

  // Address fields
  home_address: string | null;
  home_city: string | null;
  home_state: string | null;
  home_zipcode: string | null;
  home_country: string | null;

  work_address: string | null;
  work_city: string | null;
  work_state: string | null;
  work_zipcode: string | null;
  work_country: string | null;

  // Other fields
  organization: string | null;
  job_title: string | null;
  department: string | null;
  h_latitude: string | null;
  h_longitude: string | null;
  w_latitude: string | null;
  w_longitude: string | null;
}

interface MappedContact {
  id: number;
  display_name: string;
  latitude: number;
  longitude: number;
  label: string;
  primary_email?: string;
  organization?: string;
  job_title?: string;
}

interface MapWithAvatarsProps {
  contacts: Contact[];
  onClose?: () => void;
}

const FlyToLocation = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], 14, { animate: true, duration: 1.5 });
    }
  }, [latitude, longitude, map]);

  return null;
};

const ContactCard = ({ contact, onClick }: { contact: MappedContact; onClick: () => void }) => (
  <div
    style={{
      minWidth: "250px",
      maxWidth: "300px",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      backgroundColor: "white",
      cursor: "pointer",
      flex: "1 0 auto",
    }}
    onClick={onClick}
  >
    <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>{contact.display_name}</h3>
    <p style={{ marginBottom: "4px", color: "#555" }}>{contact.label} Location</p>
    {contact.primary_email && <p style={{ marginBottom: "4px", color: "#555" }}>{contact.primary_email}</p>}
    {contact.organization && <p style={{ marginBottom: "4px", color: "#555" }}>{contact.organization}</p>}
    {contact.job_title && <p style={{ marginBottom: "4px", color: "#555" }}>{contact.job_title}</p>}
  </div>
);

const MapWithAvatars: React.FC<MapWithAvatarsProps> = ({ contacts, onClose = () => {} }) => {
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [mappedContacts, setMappedContacts] = useState<MappedContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<MappedContact | null>(null);

  useEffect(() => {
    const mapContacts = () => {
      const mapped: MappedContact[] = contacts.flatMap((contact) => {
        const displayName = contact.display_name || "Unnamed Contact";
        const locations: MappedContact[] = [];

        if (contact.h_latitude != null && contact.h_longitude != null) {
          locations.push({
            id: contact.id,
            display_name: displayName,
           latitude: Number(contact.h_latitude),
           longitude: Number(contact.h_longitude),
            label: "Home",
            primary_email: contact.email,
           organization: contact.organization ?? undefined,
            job_title: contact.title,
          });
        }

        if (contact.workLatitude != null && contact.workLongitude != null) {
          locations.push({
            id: contact.id,
            display_name: displayName,
            latitude: contact.workLatitude,
            longitude: contact.workLongitude,
            label: "Work",
            primary_email: contact.email,
           organization: contact.organization ?? undefined,
            job_title: contact.title,
          });
        }

        return locations;
      });

      setMappedContacts(mapped);
    };

    mapContacts();
  }, [contacts]);

  const handleViewChange = () => {
    setIsSatelliteView(!isSatelliteView);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%" }}>
      {/* Map Section */}
      <div style={{ flex: 1, height: "calc(100% - 200px)", width: "100%" }}>
        <MapContainer center={defaultCenter} zoom={10} style={{ width: "100%", height: "100%" }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={!isSatelliteView} name="Street View">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={isSatelliteView} name="Satellite View">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {mappedContacts.map((contact) => {
            const initial = getInitial(contact.display_name);
            const avatarIcon = new L.DivIcon({
              html: `
                <div style="
                  width: 30px; 
                  height: 30px; 
                  background: #699635; 
                  color: white; 
                  font-size: 14px; 
                  font-weight: bold; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  border-radius: 50%;
                  border: 2px solid white;
                ">
                  ${initial}
                </div>
              `,
              className: "",
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });

            return (
              <Marker
                key={`${contact.id}-${contact.label}`}
                position={[contact.latitude, contact.longitude]}
                icon={avatarIcon}
              >
                <Popup>
                  <div>
                    <strong>{contact.display_name}</strong>
                    <br />
                    <span>{contact.label} Location</span>
                    <br />
                    {contact.organization && <span>{contact.organization}</span>}
                    <br />
                    {contact.job_title && <span>{contact.job_title}</span>}
                    <br />
                    {contact.primary_email && <span>{contact.primary_email}</span>}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {selectedContact && (
            <FlyToLocation latitude={selectedContact.latitude} longitude={selectedContact.longitude} />
          )}
        </MapContainer>
      </div>

      {/* Contact Cards Section */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          padding: "16px",
          backgroundColor: "#f9f9f9",
          flexWrap: "wrap",
          height: "200px",
        }}
      >
        {mappedContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} onClick={() => setSelectedContact(contact)} />
        ))}
      </div>
    </div>
  );
};

export default MapWithAvatars;
