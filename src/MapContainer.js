import {Map, Marker, InfoWindow, GoogleApiWrapper} from 'google-maps-react';
import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import GooglePlacesAutocompleteWrapper from './GooglePlacesAutocomplete'
import './MapContainer.css'

const mapStyles = {
    position: 'absolute',
    width: '100%',
    height: '70%'
}

const containerStyles = {
    position: 'absolute',
    width: '60%',
    height: '100%',
    right: '0%'
} 

const restaurants = require('./restaurants.json')
let restaurantsToDisplay = restaurants

const GOOGLE_API_KEY = ''

// Calcul de la moyenne des avis pour chaque restaurant
for (let restaurant of restaurants) {
    let starsSum = 0;
    for (let rating of restaurant.ratings) {
        starsSum += rating.stars
    }
    let starsAverage = starsSum / restaurant.ratings.length
    restaurant.starsAverage = starsAverage
}

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
            selectedPlace: {ratings: [], position: {lat: 0, lng: 0}},
            center: {},
            restaurants,
            restaurantsToDisplay,
            minStars: 1,
            maxStars: 5,
            GOOGLE_API_KEY,
            commentToAdd: '',
            restaurantToAdd: {restaurantName: "", address: "", lat: 0, lng: 0, ratings: []},
            clickedPlace: {lat: 0, lng: 0}
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
        return this.state.restaurantsToDisplay.map((restaurant, index) => {
            return <Marker key={index} id={index} name={restaurant.restaurantName} ratings={restaurant.ratings} position={{
                lat: restaurant.lat,
                lng: restaurant.lng
            }}
            onClick={this.onMarkerClick} />
        })
    }

    displayAddRestaurantMarker = (mapProps, map, clickEvent) => {
        this.setState({
            clickedPlace: {lat: clickEvent.latLng.lat(), lng: clickEvent.latLng.lng()}
        })
    }

    handleMinMaxStarsChanged = (e) => {
        if (e.target.id === "maxStars") {
            this.setState({
                maxStars: e.target.valueAsNumber,
                restaurantsToDisplay: this.state.restaurants.filter(restaurant => restaurant.starsAverage <= e.target.valueAsNumber && restaurant.starsAverage >= this.state.minStars)
            })
        } else {
            this.setState({
                minStars: e.target.valueAsNumber,
                restaurantsToDisplay: this.state.restaurants.filter(restaurant => restaurant.starsAverage >= e.target.valueAsNumber && restaurant.starsAverage <= this.state.maxStars)
            })
        }
    }

    addNewComment = () => {
        console.log("addNewComment")
    }

    addNewRestaurant = () => {
        console.log("addNewRestaurant")
    }

    handleNewCommentChange = (e) => {
        console.log("change")
        this.setState({
            commentToAdd: e.target
        })
    }

    onInfoWindowOpen = (e) => {
        console.log(e)
        const button = (<button onClick={e => {console.log("hmapbuttoni1");}}>mapbutton</button>)
        ReactDOM.render(React.Children.only(button), document.getElementById("infoWindowButtonDiv"))
    }

    displayInfoWindow = () => {
        if (this.state.activeMarker && this.state.activeMarker.name === "onClick") {
            return (
                <div id="infoWindowAddRestaurantDiv">
                    <h3>Ajouter un restaurant</h3>
                    <label>
                    Nom : 
                    <input type="text" value={this.state.restaurantToAdd.restaurantName} onChange={this.handleNewRestaurantToAddData} />
                    </label>
                    <label>
                    Adresse : 
                    <input type="text" value={this.state.restaurantToAdd.address} onChange={this.handleNewRestaurantToAddData} />
                    </label>
                    <label>
                    Latitude : 
                    <input type="text" value={this.state.restaurantToAdd.lat} onChange={this.handleNewRestaurantToAddData} />
                    </label>
                    <label>
                    Longitude : 
                    <input type="text" value={this.state.restaurantToAdd.lng} onChange={this.handleNewRestaurantToAddData} />
                    </label>
                    <button id="addRestaurantButton" onClick={this.addNewRestaurant}>Ajouter</button>
                </div>
            )
        } else if (this.state.selectedPlace.ratings) {
            return (
                <div>
                    <h4>{this.state.selectedPlace.name}</h4>
                    {this.state.selectedPlace.ratings.map((rating, index) => {
                        return <p key={index}>{rating.comment}</p>
                    })}
                    <img alt="Restaurant street view" src={`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${this.state.selectedPlace.position.lat},${this.state.selectedPlace.position.lng}&heading=151.78&pitch=-0.76&key=${GOOGLE_API_KEY}`}></img>
                    <label>
                    Ajouter un commentaire :
                    <input type="text" value={this.state.commentToAdd} onChange={this.handleNewCommentChange} />
                    </label>
                    <button onClick={this.addNewComment}>Ajouter</button>
                </div>
            )
        }
    }

    render () {
        return (
            <div className='footer'>
                <div className="dashboard">
                <GooglePlacesAutocompleteWrapper></GooglePlacesAutocompleteWrapper>
                    <label for="minStars">Minimum d'étoiles :</label>
                    <input type="number" id="minStars" name="minStars"
                        min="1" max="5" onChange={this.handleMinMaxStarsChanged} step="0.5"></input>
                    <label for="maxStars">Maximum d'étoiles :</label>
                    <input type="number" id="maxStars" name="maxStars"
                        min="1" max="5" step="0.5" onChange={this.handleMinMaxStarsChanged}></input>
                    <div className='restaurantsList'>
                        {this.state.restaurantsToDisplay.map((restaurant, index) => {
                            return <div key={index}>
                                <h5>{restaurant.restaurantName}</h5>
                                <p>{restaurant.address}</p>
                                <p>Moyenne des avis : {restaurant.starsAverage}</p>
                            </div>
                        })}
                    </div>
                </div>
                <div id="googleMapDiv">
                    <Map id="mgoogleMap" google={this.props.google} zoom={14} style={mapStyles} containerStyle={containerStyles} initialCenter={{lat: 13.13, lng: 12.12}} center={this.state.center} onClick={this.displayAddRestaurantMarker}>
                        <Marker position={this.state.center} name='Bully' onClick={this.onMarkerClick} ratings={[]} />
                        <Marker position={this.state.clickedPlace} name='onClick' onClick={this.onMarkerClick}/>
                        {this.displayMarkers()}
                        <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose} onOpen={this.onInfoWindowOpen}>
                            <div id="infoWindowButtonDiv" />
                            {this.displayInfoWindow()}
                        </InfoWindow>
                        {/* <InfoWindowEx marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose}>
                            <button type="button" onClick={this.addNewComment}>
                                Show details
                            </button>
                        </InfoWindowEx> */}
                    </Map>
                </div>
            </div>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: GOOGLE_API_KEY
}) (MapContainer)