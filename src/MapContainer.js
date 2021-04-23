import {Map, Marker, InfoWindow, GoogleApiWrapper} from 'google-maps-react';
import React, { Component } from 'react';

const mapStyles = {
    position: 'absolute',
    width: '100%',
    height: '100%'
}

const containerStyles = {
    position: 'absolute',
    width: '70%',
    height: '100%',
    left: '30%'
}

const restaurants = require('./restaurants.json')

// Calcul de la moyenne des avis pour chaque restaurant
for (let restaurant of restaurants) {
    let starsSum = 0;
    for (let rating of restaurant.ratings) {
        starsSum += rating.stars
    }
    let starsAverage = starsSum / restaurant.ratings.length
    restaurant.starsAverage = starsAverage
}

const res = fetch('https://maps.googleapis.com/maps/api/streetview?size=600x300&location=46.414382,10.013988&heading=151.78&pitch=-0.76&key=AIzaSyAk8SmQXl4LHJY7kyQcMfUTCp7YUvXKkzY').then(res => res)
console.log(res)

export class MapContainer extends Component {

    constructor(props) {
        super(props)

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                this.setState({
                    center: {lat: position.coords.latitude, lng: position.coords.longitude}
                })
            })
        } else {
            console.log("Pas d'API de geolocation disponible :(")
        }

        this.state = {
            showingInfoWindow: false,   // Hides or shows the InfoWindow
            activeMarker: {},           // Show the active marker upon click
            selectedPlace: {ratings: []},
            center: {},
            restaurants
        }
    }

    onMarkerClick = (props, marker, e) => {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        })
    }

    onClose = props => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            })
        }
    }

    displayMarkers = () => {
        return this.state.restaurants.map((restaurant, index) => {
            return <Marker key={index} id={index} name={restaurant.restaurantName} ratings={restaurant.ratings} position={{
                lat: restaurant.lat,
                lng: restaurant.lng
            }}
            onClick={this.onMarkerClick} />
        })
    }

    render () {
        return (
            <div className='footer'>
                <div className='restaurantsList'>
                    {this.state.restaurants.map((restaurant, index) => {
                        return <div key={index}>
                            <h5>{restaurant.restaurantName}</h5>
                            <p>{restaurant.address}</p>
                            <p>Moyenne des avis : {restaurant.starsAverage}</p>
                        </div>
                    })}
                </div>
                <Map google={this.props.google} zoom={14} style={mapStyles} containerStyle={containerStyles} initialCenter={{lat: 13.13, lng: 12.12}} center={this.state.center}>
                    <Marker position={this.state.center} name='Bully' onClick={this.onMarkerClick}/>
                    {this.displayMarkers()}
                    <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose}>
                        <div>
                            <h4>{this.state.selectedPlace.name}</h4>
                            <image src={'https://maps.googleapis.com/maps/api/streetview?size=600x300&location=46.414382,10.013988&heading=151.78&pitch=-0.76&key=AIzaSyAk8SmQXl4LHJY7kyQcMfUTCp7YUvXKkzY'}></image>
                            {this.state.selectedPlace.ratings.map((rating, index) => {
                                return <p key={index}>{rating.comment}</p>
                            })}
                        </div>
                    </InfoWindow>
                </Map>
            </div>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyAk8SmQXl4LHJY7kyQcMfUTCp7YUvXKkzY'
}) (MapContainer)