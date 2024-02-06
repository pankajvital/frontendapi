import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useDataFetcherWithToken from "../customhook/useDataFetch";
import { useLocation } from "react-router-dom";
// import { Link } from "react-router-dom";
import { companyName } from "./Constants";
// import FlightPriceSlider from "./FlightPriceSlider";
import { useNavigate } from "react-router-dom";
import MyComponent from "../customhook/axios";
// import GetFullName from "../customhook/Getfullname";
const FlightResult = () => {
  const [excelData, setExcelData] = useState([]);
  const [countryNames, setCountryNames] = useState({});
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }); // Adjust the delay as needed

    return () => clearTimeout(timeout); // Clear timeout on component unmount
  }, []); // This will run only once when the component mounts

//   useEffect(() => {
//     fetchData();
//   }, []); // The empty dependency array ensures that the effect runs once when the component mounts

//   const fetchData = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/excelData");
//       setExcelData(response.data);
//       console.log("Excel Data", response.data); // Use response.data instead of excelData
//     } catch (error) {
//       console.error("Error fetching Excel data:", error);
//     }
//   };
  const location = useLocation();
  console.log("location data", location.state);
  console.log("location tpe", location.state.tripType);
  let trip;
  if (location.state.tripType === "roundTrip") {
    trip = "R";
  } else if (location.state.tripType === "oneWay") {
    trip = "O";
  } else {
    trip = "M";
  }
  console.log("trip", trip);

  let cabin;
  if (location.state.allTripDetails[0].cabin === "ECONOMY") {
    cabin = "E";
  } else if (location.state.allTripDetails.cabin === "BUSINESS") {
    cabin = "B";
  } else {
    cabin = "F";
  }
  console.log("cabin", cabin);

  const { accessToken, isLoading, error } = useDataFetcherWithToken();
  const [apiData, setApiData] = useState(null); // State variable to hold API data

  const [displayedResults, setDisplayedResults] = useState(10); // Initial number of results to display
  console.log(apiData);

  // toggle show code
  const [isOpenArray, setIsOpenArray] = useState(
    apiData && apiData.data ? new Array(apiData.data.length).fill(false) : []
  );


  const [chevronVisibleArray, setChevronVisibleArray] = useState(
    Array(isOpenArray.length).fill(false)
  );

  const toggleItem = async (offer, index) => {
    const newArray = [...isOpenArray];
    newArray[index] = !newArray[index];
    setIsOpenArray(newArray);
  
    const newChevronArray = [...chevronVisibleArray];
    newChevronArray[index] = !newChevronArray[index];
    setChevronVisibleArray(newChevronArray);
  
    ////below is fullname of iatacode
    console.log("offer data", offer);
  
  };
  function formatTime(timestamp) {
    const dateObject = new Date(timestamp);
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    let amOrPm = hours >= 12 ? "PM" : "AM";

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours = hours - 12;
    }

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutes} ${amOrPm}`;
  }

  // Function to format a timestamp into a readable date string
  function formatDate(timestamp) {
    const dateObject = new Date(timestamp);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const month = monthNames[dateObject.getMonth()];
    const day = dateObject.getDate();
    const dayOfWeek = dayNames[dateObject.getDay()];
    return `${month}, ${day}, ${dayOfWeek}`;
  }

  // filter price
  const [flightPrice, setFlightPrice] = useState(0);
  const [minFlightPrice, setMinFlightPrice] = useState(0);
  const [maxFlightPrice, setMaxFlightPrice] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  // const [apiData, setApiData] = useState(initialApiData);

  const [noDataFound, setNoDataFound] = useState(false);

  useEffect(() => {
    if (apiData && apiData.data && apiData.data.length > 0) {
      const prices = apiData.data.map((item) => parseFloat(item.price.total));
      setMinFlightPrice(Math.min(...prices));
      setMaxFlightPrice(Math.max(...prices));
      setFlightPrice(Math.min(...prices));
      setFilteredData(apiData.data);
    }
  }, [apiData]);

  const handleSliderChange = (event) => {
    const selectedPrice = parseFloat(event.target.value);
    setFlightPrice(selectedPrice);
  };

  const handleApplyFilter = () => {
    // Filter the flight data based on the selected price range
    const filteredData = apiData.data.filter(
      (item) => parseFloat(item.price.total) <= flightPrice
    );

    // Store the filtered data in state for rendering
    setFilteredData(filteredData);
    console.log("filteredData", filteredData);
  };

  const handleApplyreset = () => {
    setFilteredData(apiData.data);
  };

  console.log("check date formate", location.state.from);



  useEffect(() => {
    if (isLoading) {
      // Loading state
      setNoDataFound(false); // Reset noDataFound when loading
    } else if (error) {
      // Handle error state
      setNoDataFound(true); // Set noDataFound to true when there's an error
    } else if (
      accessToken &&
      location.state &&
      location.state.allTripDetails &&
      location.state.allTripDetails.length >= 2
    ) {
      console.log("Access Token:", accessToken);
  
      let apiUrlA = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${location.state.allTripDetails[0].origin}&destinationLocationCode=${location.state.allTripDetails[0].destination}&departureDate=${location.state.allTripDetails[0].from}&adults=${location.state.tripDetailsPassenger.passengerData.adults}&children=${location.state.tripDetailsPassenger.passengerData.children}&infants=${location.state.tripDetailsPassenger.passengerData.infant}&travelClass=${location.state.allTripDetails[0].cabin}&currencyCode=USD&max`;
  
      let apiUrlB = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${location.state.allTripDetails[0].destination}&destinationLocationCode=${location.state.allTripDetails[1].destination}&departureDate=${location.state.allTripDetails[0].to}&adults=${location.state.tripDetailsPassenger.passengerData.adults}&children=${location.state.tripDetailsPassenger.passengerData.children}&infants=${location.state.tripDetailsPassenger.passengerData.infant}&travelClass=${location.state.allTripDetails[0].cabin}&currencyCode=USD&max`;
  
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
  
      // Make the first API call
      axios
        .get(apiUrlA, { headers })
        .then((responseA) => {
          console.log("API Response A:", responseA.data);
  
          // Make the second API call
          axios
            .get(apiUrlB, { headers })
            .then((responseB) => {
              console.log("API Response B:", responseB.data);
              let combinedData;
  
              combinedData = {
                data: responseA.data.data.map((itemA) => {
                  const matchingItemB = responseB.data.data.find(
                    (itemB) => itemB.id === itemA.id
                  );
                  if (matchingItemB) {
                    const totalPricesA = parseFloat(
                      itemA.travelerPricings[0].price.total
                    );
                    const totalPricesB = parseFloat(
                      matchingItemB.travelerPricings[0].price.total
                    );

  
                    return {
                      ...itemA,
                      itineraries: [
                        ...itemA.itineraries,
                        ...matchingItemB.itineraries,
                      ],
                      travelerPricings: [
                        ...itemA.travelerPricings,
                        // ...matchingItemB.travelerPricings,
                      ],
                    //   totalPrices: (totalPricesA + totalPricesB).toFixed(2),
                      totalPrices: (totalPricesA).toFixed(2),

                    };
                  }
                  return null; // Exclude items without a matching ID
                }).filter(Boolean), // Filter out null values
                dictionaries: {
                  ...responseA.data.dictionaries,
                  ...responseB.data.dictionaries.carriers,
                },
                carriers: {
                  ...responseA.data.dictionaries.carriers,
                  ...responseB.data.dictionaries.carriers,
                },
                aircraft: {
                  ...responseA.data.dictionaries.aircraft,
                  ...responseB.data.dictionaries.aircraft,
                },
              };
  
              // Update the state with combined data
              setApiData(combinedData);
  
              if (combinedData.data.length > 0) {
                setNoDataFound(false); // Resetting noDataFound when data is available
              } else {
                setNoDataFound(true); // Set noDataFound to true when no data is available
              }
  
              console.log("Api data multicity: ", combinedData);
            })
            .catch((apiErrorB) => {
              console.error("API Error B:", apiErrorB);
              setNoDataFound(true); // Set noDataFound to true in case of API error
            });
        })
        .catch((apiErrorA) => {
          console.error("API Error A:", apiErrorA);
          setNoDataFound(true); // Set noDataFound to true in case of API error
        });
    }
  }, [accessToken, isLoading, error, location.state.details,displayedResults]);
  









  const totalResultsCount = apiData && apiData.data ? apiData.data.length : 0;
  const loadMoreResults = () => {
    // Increase the displayed results by 5 on each click
    setDisplayedResults(prevCount => prevCount + 5);
  };


  // //airline categories code
  const [selectedCarriers, setSelectedCarriers] = useState([]);
  const [allUnchecked, setAllUnchecked] = useState(true);

  const handleCarrierFilterChange = useCallback((e) => {
    const carrier = e.target.value;
    setSelectedCarriers((prevSelectedCarriers) => {
      if (prevSelectedCarriers.includes(carrier)) {
        const newSelectedCarriers = prevSelectedCarriers.filter(
          (c) => c !== carrier
        );
        if (newSelectedCarriers.length === 0) {
          setAllUnchecked(true); // All checkboxes are unchecked
        }
        return newSelectedCarriers;
      } else {
        setAllUnchecked(false); // At least one checkbox is checked
        return [...prevSelectedCarriers, carrier];
      }
    });
  }, []);

  // stop , non-stop code
  // const [selectedLabel, setSelectedLabel] = useState("Non-Stop");
  const [displayedData, setDisplayedData] = useState(null);
  const handleLabelClick = (label) => {
    let filteredData = [];
  
    if (label === "Non-Stop") {
      filteredData = apiData.data.filter(
        (item) =>
          item.itineraries[0].segments.length === 1 ||
          (item.itineraries.length === 1 &&
            item.itineraries[0].segments.length === 1)
      );
    } else if (label === "1 Stop") {
      filteredData = apiData.data.filter(
        (item) =>
          item.itineraries[0].segments.length === 2 ||
          (item.itineraries.length === 1 &&
            item.itineraries[0].segments.length === 2)
      );
    } else if (label === "2 Stops") {
      filteredData = apiData.data.filter(
        (item) =>
          item.itineraries[0].segments.length >= 3 ||
          (item.itineraries.length === 1 &&
            item.itineraries[0].segments.length >= 3)
      );
    }
  
    setDisplayedData(filteredData);
  };

  // Create a state variable to hold the selected data
  const [selectedDataIndex, setSelectedDataIndex] = useState(null);
  const navigate = useNavigate();

  const handleDataSelection = (index) => {
    if (displayedData && displayedData.length > index) {
      // If displayedData exists and has items at the selected index
      setSelectedDataIndex(index);
    } else if (apiData && apiData.data && apiData.data.length > index) {
      // If displayedData is empty or not set, use the original data
      setSelectedDataIndex(index);
      setDisplayedData(apiData.data); // Set displayedData to the original data
    }
  };

  useEffect(() => {
    if (
      selectedDataIndex !== null &&
      displayedData &&
      displayedData.length > selectedDataIndex
    ) {
      const selectedData = displayedData[selectedDataIndex];
      navigate("/flightSubmit", {
        state: {
          data: [selectedData],
          dictionaries: apiData.dictionaries,
          tripType: location.state.tripType,
        },
      });
    }
  }, [selectedDataIndex, displayedData, apiData, navigate]);
  console.log('selected data send to submit', apiData)


  useEffect(() => {
    console.log("displayedData", displayedData);
  }, [displayedData]);

  // filter by price code min or max
  useEffect(() => {
    if (apiData && apiData.data && apiData.data.length > 0) {
      const prices = apiData.data.map((item) => parseFloat(item.price.total));
      setMinFlightPrice(prices[0]);
      setMaxFlightPrice(prices[prices.length - 1]);
      setFlightPrice(prices[0]);
    }
  }, [apiData]);

  // Render your data when available


  function capitalizeAllWords(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Render your data when available

  if (!apiData && !noDataFound) {
    return (
      <div className="search-load text-center">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="serarch-title">
                <p className="load-title">
                  Please wait while we are searching unpublished exclusive for you
                  from over 450+ airlines
                </p>
              </div>
            </div>
            <div className="col-md-4 search-load-col">
              <div className="search-wrap-load">
              <p>{location.state.allTripDetails.origin}  </p>
              <span>
                  {location.state.airportorigin.length > 1
                  ? capitalizeAllWords(location.state.airportorigin[1].name) 
                  : capitalizeAllWords(location.state.airportorigin[0].name)} Airport, <br/>
                  {location.state.airportorigin.length > 1
                  ? capitalizeAllWords(location.state.airportorigin[1].address.cityName)
                  : capitalizeAllWords(location.state.airportorigin[0].address.cityName)} (
                  {location.state.airportorigin.length > 1
                  ? (location.state.airportorigin[1].address.cityCode)
                  : (location.state.airportorigin[0].address.cityCode)}), <br/>
                  {location.state.airportorigin.length > 1
                  ? capitalizeAllWords(location.state.airportorigin[1].address.countryName)
                  : capitalizeAllWords(location.state.airportorigin[0].address.countryName)}
              </span>
              </div>
            </div>
            <div className="col-md-4 search-load-col">
              <div className="search-wrap-load-img">
                  <div className="">
                  <img
                    src="https://zupimages.net/up/19/34/4820.gif"
                    className="plane-img"
                    alt="loading"
                  />
                  <div className="earth-wrapperhh">
            <div className="earth" />
          </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 search-load-col">
            <div className="search-wrap-load-r">
              <p>{location.state.allTripDetails.destination} </p>
              <span>
                  {location.state.airportdestination.length > 1
                  ? capitalizeAllWords(location.state.airportdestination[1].name) 
                  : capitalizeAllWords(location.state.airportdestination[0].name)} Airport, <br/>
                  {location.state.airportdestination.length > 1
                  ? capitalizeAllWords(location.state.airportdestination[1].address.cityName)
                  : capitalizeAllWords(location.state.airportdestination[0].address.cityName)} (
                  {location.state.airportdestination.length > 1
                  ? (location.state.airportdestination[1].address.cityCode)
                  : (location.state.airportdestination[0].address.cityCode)}), <br/>
                  {location.state.airportdestination.length > 1
                  ? capitalizeAllWords(location.state.airportdestination[1].address.countryName)
                  : capitalizeAllWords(location.state.airportdestination[0].address.countryName)}
              </span>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (noDataFound) {
    return (
      <>
        <div className="search-img top-page">
          <div className="loader-error row">
            <div className="wait">
              <img
                src="images/loading-banner.jpg"
                alt="Error Image"
                className="error-image img-fluid"
              />
              <p className="load-title">{!apiData ? "" : ""}</p>
            </div>
          </div>
        </div>
      </>
    );
  }
  const calculatePrice = (apiData, selectedCarrier) => {
    if (!apiData || !apiData.data) {
      return 0; // Handle the case where the required data is missing
    }

    // Find the correct pricing based on the selected carrier
    const pricing = apiData.data.find((data) =>
      data.itineraries.some((itinerary) =>
        itinerary.segments.some(
          (segment) => segment.carrierCode === selectedCarrier
        )
      )
    );

    if (!pricing || !pricing.price || !pricing.price.total) {
      return 0; // Handle missing or invalid pricing data
    }

    return parseFloat(pricing.price.total); // Convert total price to a float if it's a string
  };

  const dateStringD= location.state.allTripDetails.from;
  const dateStringA = location.state.allTripDetails.to;
  const options = { month: "short", day: "numeric", weekday: "short" };
  
  const formattedDateD = new Date(dateStringD).toLocaleString("en-US", options);
  const formattedDateA = new Date(dateStringA).toLocaleString("en-US", options);
  


  return (
    <>
      
      <section id="explore_area" className="mt-3">
        <div className="container-fluid">
          {/* Section Heading */}

          <div className="row">
          <div className="col-md-12 mb-3">
             <div className="theme_search_form_area-result">
                <MyComponent />
              </div>
            </div>
            <div className="col-lg-3">
              <div className="left_side_search_area tour_details_right_sidebar_wrapper">
                <div className="left_side_search_boxed">
                  
                  <div className="filter-price">
                    <div>
                      <label htmlFor="customRange2" className="form-label">
                        Flight Price: ${flightPrice}
                      </label>
                      <div className="filter-s-l d-flex justify-content-between">
                        <h6>Min</h6>
                        <h6>Max</h6>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min={minFlightPrice}
                        max={maxFlightPrice}
                        id="customRange2"
                        value={flightPrice}
                        onChange={handleSliderChange}
                      />
                      <div className="filter-s-l d-flex justify-content-between">
                        <h6>{minFlightPrice} USD</h6>
                        <h6>{maxFlightPrice} USD</h6>
                      </div>
                      <div className="d-flex justify-content-between">
                        <button
                          className="apply"
                          type="button"
                          onClick={handleApplyFilter}
                        >
                          Apply
                        </button>
                        &nbsp;
                        <button
                          className="apply"
                          type="button"
                          onClick={handleApplyreset}
                        >
                          Reset Price
                        </button>
                      </div>

                      {/* Display the filtered data, e.g., in a list */}
                      {filteredData.map((item) => (
                        <div key={item.id}>
                          {/* Render flight details here */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="left_side_search_boxed">
                  <div className="left_side_search_heading">
                    <h5>Airlines</h5>
                  </div>
                  <div className="tour_search_type">
                    <div>
                      {apiData &&
                        apiData.dictionaries &&
                        apiData.dictionaries.carriers && (
                          <div>
                            {Object.keys(apiData.dictionaries.carriers).map(
                              (carrier, index) => {
                                const isChecked =
                                  selectedCarriers.includes(carrier);
                                return (
                                  <div className="form-check" key={index}>
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={carrier}
                                      id={`flexCheckDefaults${index + 1}`}
                                      onChange={handleCarrierFilterChange}
                                      checked={isChecked}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`flexCheckDefaults${index + 1}`}
                                    >
                                      <span className="area_flex_one">
                                        <span>
                                          {
                                            apiData.dictionaries.carriers[
                                              carrier
                                            ]
                                          }
                                        </span>
                                        <span>
                                          {location.state.allTripDetails.to
                                            ? apiData.data.filter((item) =>
                                                item.itineraries.some(
                                                  (itinerary) =>
                                                    itinerary.segments &&
                                                    itinerary.segments.length >
                                                      0 &&
                                                    itinerary.segments[0]
                                                      .carrierCode === carrier
                                                )
                                              ).length
                                            : apiData.data.filter((item) =>
                                                item.itineraries.some(
                                                  (itinerary) =>
                                                    itinerary.segments &&
                                                    (itinerary.segments.length >
                                                      0 ||
                                                      itinerary.segments
                                                        .length > 1) && // This line considers both 0 and 1 segments
                                                    (itinerary.segments[0]
                                                      .carrierCode ===
                                                      carrier ||
                                                      itinerary.segments[1]
                                                        ?.carrierCode ===
                                                        carrier) // Handling 0 and 1 segments
                                                )
                                              ).length}
                                        </span>
                                      </span>
                                    </label>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="left_side_search_boxed">
                  <div className="left_side_search_heading">
                    <h5>Number of Stops</h5>
                  </div>
                  <div className="tour_search_type">
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="nonStop"
                        onChange={() => handleLabelClick("Non-Stop")}
                      />
                      <label className="form-check-label" htmlFor="nonStop">
                        Non-Stop
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="oneStop"
                        onChange={() => handleLabelClick("1 Stop")}
                      />
                      <label className="form-check-label" htmlFor="oneStop">
                        1 Stop
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoStops"
                        onChange={() => handleLabelClick("2 Stops")}
                      />
                      <label className="form-check-label" htmlFor="twoStops">
                        2 Stops
                      </label>
                    </div>
                  </div>
                  <div>
                 
                  </div>
                </div>

                <div className="left_side_search_boxed">
                  <div className="left_side_search_heading">
                    <h5>Departure Time - Destination</h5>
                  </div>
                  <div className="tour_search_type">
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="nonStop"
                        onChange={() => handleLabelClick("Non-Stop")}
                      />
                      <label className="form-check-label" htmlFor="nonStop">
                        Early Morning
                        <span className="area_flex_one-der-arr-f">
                        (12:00am - 4:59am)</span>
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="oneStop"
                        onChange={() => handleLabelClick("1 Stop")}
                      />
                      <label className="form-check-label" htmlFor="oneStop">
                      Morning
                      <span className="area_flex_one-der-arr-f">
                        (12:00am - 4:59am)</span>
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoStops"
                        onChange={() => handleLabelClick("2 Stops")}
                      />
                      <label className="form-check-label" htmlFor="twoStops">
                      Afternoon
                      <span className="area_flex_one-der-arr-f">
                      (5:00am - 11:59am)</span>
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoStops"
                        onChange={() => handleLabelClick("2 Stops")}
                      />
                      <label className="form-check-label" htmlFor="twoStops">
                      Evening
                      <span className="area_flex_one-der-arr-f">
                        (6:00pm - 11:59pm)</span>                      
                      </label>
                    </div>
                  </div>
                  <div>
                  </div>
                </div>

                <div className="left_side_search_boxed">
                  <div className="left_side_search_heading">
                    <h5>Arrival Time - Destination</h5>
                  </div>
                  <div className="tour_search_type">
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="nonStop"
                        onChange={() => handleLabelClick("Non-Stop")}
                      />
                      <label className="form-check-label" htmlFor="nonStop">
                        Early Morning
                        <span className="area_flex_one-der-arr-f">
                        (12:00am - 4:59am)</span>
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="oneStop"
                        onChange={() => handleLabelClick("1 Stop")}
                      />
                      <label className="form-check-label" htmlFor="oneStop">
                      Morning
                      <span className="area_flex_one-der-arr-f">
                        (12:00am - 4:59am)</span>
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoStops"
                        onChange={() => handleLabelClick("2 Stops")}
                      />
                      <label className="form-check-label" htmlFor="twoStops">
                      Afternoon
                      <span className="area_flex_one-der-arr-f">
                      (5:00am - 11:59am)</span>
                      </label>
                    </div>
                    <div className="form-check sideresult-f">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoStops"
                        onChange={() => handleLabelClick("2 Stops")}
                      />
                      <label className="form-check-label" htmlFor="twoStops">
                      Evening
                      <span className="area_flex_one-der-arr-f">
                        (6:00pm - 11:59pm)</span>                      
                      </label>
                    </div>
                  </div>
                  <div>
                  </div>
                </div>

              </div>
            </div>
            <div className="col-lg-9 re-side-sp">
              <div className="left_side_search_boxed-airline">
                
                <div className="">
                  <div className="row mb-2">
                  <p className="total-res">
                  <a href="/" className="text-white">
                            Go To Home
                          </a>
                  </p>
                  <p className="total-tet text-center">
                  Best Price by Airlines: Book Today - {companyName} Price Match Guarantee!
                          </p>
                         
                  </div>
                  {apiData &&
                    apiData.dictionaries &&
                    apiData.dictionaries.carriers && (
                      <div className="row filter-logo airline-f-row">
                        {Object.keys(apiData.dictionaries.carriers).map(
                          (carrier, index) => {
                            const isChecked =
                              selectedCarriers.includes(carrier);

                            // Find segments for the carrier
                            const carrierSegments = apiData.data.filter(
                              (item) =>
                                item.itineraries.some((itinerary) =>
                                  itinerary.segments.some(
                                    (segment) => segment.carrierCode === carrier
                                  )
                                )
                            );

                            const priceTotal = calculatePrice(apiData, carrier);

                            let displayText = [];

                            if (carrierSegments.length > 0) {
                              const stopsInfo = {};

                              carrierSegments.forEach((segment) => {
                                const numStops =
                                  segment.itineraries[0].segments.length - 1;
                                const stopText =
                                  numStops <= 0
                                    ? "Non-Stop"
                                    : numStops === 1
                                    ? "1 Stop"
                                    : `${numStops} Stops`;
                                const priceTotal = calculatePrice(segment); // Function to calculate price based on segment

                                if (!stopsInfo[stopText]) {
                                  stopsInfo[stopText] = priceTotal
                                    ? `$${priceTotal.toFixed(2)}`
                                    : "Not available";
                                }
                              });

                              displayText = Object.keys(stopsInfo).map(
                                (stop) => (
                                  <div key={stop}>
                                    ${priceTotal.toFixed(2)} - <span className="stop-click">{stop}</span>
                                  </div>
                                )
                              );
                            }

                            return (
                              <div className="form-check filter-b-side-s col-md" key={index}>
                                <img
                                  style={{ width: "25px" }}
                                  src={`https://cmsrepository.com/static/flights/flight/airlinelogo-png/${carrier.toLowerCase()}.png`}
                                  alt={carrier}
                                />
                                &nbsp;&nbsp; <br />
                                <span
                                  className="mb-3"
                                  style={{ fontSize: "13px" }}
                                >
                                
                                  <label
                                    className="form-check-label"
                                    // htmlFor={`flexCheckDefaults${index + 1}`}
                                  >
                                    <span className="area_flex_one">
                                      <span>
                                        {apiData.dictionaries.carriers[carrier]} 
                                      </span>

                                    </span>
                                  </label>
                                  <br />
                                </span>
                                <span className="f-l-b">
                                  {displayText}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}

<div className="row mb-2">
                  <p className="total-tet text-center">
                      
                       
                             {location.state.airportorigin.length > 1
                              ? capitalizeAllWords(location.state.airportorigin[1].name) 
                              : capitalizeAllWords(location.state.airportorigin[0].name)} All Airports USA to  {location.state.airportdestination.length > 1 ? capitalizeAllWords(location.state.airportdestination[1].name) : capitalizeAllWords(location.state.airportdestination[0].name)} {formattedDateD} to {formattedDateA}
                   
                          </p>
                          <p className="total-res">
                            {totalResultsCount} Results found 
                          </p>
                  </div>
                </div>

                {/* </div> */}
              </div>
              {apiData &&
                apiData.data &&
                (allUnchecked || selectedCarriers.length === 0
                  ? (filteredData || apiData.data) &&
                    (displayedData
                      ? displayedData.slice(0, displayedResults)
                      : apiData.data.slice(0, displayedResults)) //  displayed results
                  : // (displayedData ? displayedData : apiData.data) // Add the new condition here
                    (filteredData || apiData.data).filter(
                      (
                        item // Further filter filteredData if needed
                      ) => {
                        const itineraryIndexArray =
                          item.itineraries.length === 1 ? [0] : [0, 1];
                        return itineraryIndexArray.some((itineraryIndex) =>
                          selectedCarriers.includes(
                            item.itineraries[itineraryIndex].segments[0]
                              .carrierCode
                          )
                        );
                      }
                    )
                )

                  // .sort((offerA, offerB) => {
                  //   // Custom sorting function
                  //   if (
                  //     offerA.itineraries[0].segments[0].carrierCode ===
                  //     excelData[0].airline
                  //   ) {
                  //     return -1; // 'excelData.airline' comes first
                  //   } else if (
                  //     offerB.itineraries[0].segments[0].carrierCode ===
                  //     excelData[0].airline
                  //   ) {
                  //     return 1; // 'excelData.airline' comes second
                  //   } else {
                  //     return 0; // No preference for other items
                  //   }
                  // })
                  .map((offer, index) => {
                    let stops;
                    if (offer.itineraries[0].segments.length === 1) {
                      stops = "0";
                    } else if (offer.itineraries[0].segments.length === 2) {
                      stops = "1";
                    } else if (offer.itineraries[0].segments.length === 3) {
                      stops = "2";
                    } else {
                      stops = "3";
                    }

                    return (
                      <div
                        key={index}
                        className="row result-main-row"
                        
                      >
                        <div className="col-md-9 flight-col-line">
                          {offer.itineraries.map((itinerary, index) => {
                         
                            
                            const carrierCode =
                              itinerary?.segments[0]?.carrierCode;
                            // const carrierCodeSec = itinerary?.segments[0]?.carrierCode;

                            const fullCarrierName =
                              apiData.dictionaries.carriers[carrierCode];
                            // const fullCarrierNameSec = apiData.dictionaries.carriers[carrierCodeSec];
                            const lastSegment =
                              itinerary.segments[itinerary.segments.length - 1];

                            // const lastSegmentArrivalTime = format(lastSegment.arrival.at);
                            const lastSegmentArrivalIataCode =
                              lastSegment.arrival.iataCode;
                            //// below code of date and time

                            const formattedDepartureDate = formatDate(
                              itinerary.segments[0].departure.at
                            );
                            const formattedArrivalDate = formatDate(
                              itinerary.segments[0].arrival.at
                            );

                            // const ansDate = formattedDepartureDate; // Use the formatted departure time
                            // const ans1Date = formattedArrivalDate; // Use the formatted arrival time

                            

                            const formattedDepartureTime = formatTime(
                              itinerary.segments[0].departure.at

                            );

                            const formattedArrivalTime = formatTime(
                              lastSegment.arrival.at
                            );

                            // Now you can use the formatted date and time values within the loop
                            const ans = formattedDepartureTime; // Use the formatted departure time
                            const ans1 = formattedArrivalTime; // Use the formatted arrival time

                            const numStops = itinerary.segments.length - 1;

                            const content =
                              index === 0
                                ? "Out bound"
                                : index === 1
                                ? "In bound"
                                : "Some default content";

                            return (
                              <div className="">
                                <div className="row result-line">
                                  <div className="flight_search_left col-md-2 ">
                                    <div className="flight_logo text-center">
                                      <img
                                        src={`https://cmsrepository.com/static/flights/flight/airlinelogo-png/${itinerary.segments[0].carrierCode.toLowerCase()}.png`}
                                        alt={itinerary.segments[0].carrierCode}
                                      />
                                      <p className="img-air-f-up">{fullCarrierName}</p>
                                    </div>
                                    {/* <div className="flight_search_destination my-sear-des">
                                      <h3>
                                        {
                                          itinerary.segments[0].departure
                                            .iataCode
                                        } 
                                      </h3>
                                      <h6>{ans}</h6>
                                      
                                      
                                    </div> */}
                                  </div>
                                  <div className="flight_search_middel col-md-7">
                                    <div className="flight-wrap-ali">
                                      <div className="flight_search_destination text-center my-sear-des">
                                        <h3>
                                          {
                                            itinerary.segments[0].departure
                                              .iataCode
                                          } 
                                        </h3>
                                        <h6>{ans}</h6>
                                        
                                      </div>
                                      <div className="flight_right_arrow arrow-md-space">
                                        <span className="arrow-text">
                                          {content}
                                        </span>
                                        <br/>
                                        <span className="air-arrow">&#x2708;</span>
                                        <h6>{formattedDepartureDate}</h6>
                                        {/* <h6>
                                          {numStops <= 0
                                            ? "Non-Stop"
                                            : numStops === 1
                                            ? "1 Stop"
                                            : `${numStops} Stops`}
                                        </h6>

                                        <p>
                                          {itinerary.duration
                                            .slice(2) // Remove "pt" prefix
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ")}{" "}
                                        </p> */}
                                      </div>
                                      <div className="flight_search_destination  my-sear-des">
                                      {/* my-flight-side */}
                                        <h3>{lastSegmentArrivalIataCode}</h3>
                                    
                                        <h6>{ans1}</h6>
                                        {/* <h6>{formattedArrivalDate}</h6> */}
                                      </div>
                                    
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                  <div className="flight_search_destination-last my-sear-des">
                                      <h6>
                                        {numStops <= 0
                                          ? "Non-Stop"
                                          : numStops === 1
                                          ? "1 Stop"
                                          : `${numStops} Stops`}
                                      </h6>

                                      <p>
                                        {itinerary.duration
                                          .slice(2) // Remove "pt" prefix
                                          .match(/\d+/g) // Extract individual numbers
                                          .map((num, index) => (index === 0 ? `${num}H` : index === 1 ? ` ${num}M` : ` ${num}S`))
                                          .join(" ")}
                                      </p>

                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="col-md-3 text-center">
                          <div className="wrap-amout">
                            <div>
                              <h5>{location.state.allTripDetails.cabin}</h5>
                              <h2 className="mb-3">
                                ${offer.travelerPricings[0].price.total} 
                              </h2>
                            </div>

                            <div>
                              {excelData.map((data, index) => {
                                const flightclass =
                                  offer.travelerPricings[0]
                                    .fareDetailsBySegment[0].class;
                                return (
                                  <div key={index}>
                                    <ul
                                      style={{
                                        listStyle: "none",
                                        // display: "none",
                                      }}
                                    >
                                      {(data.airline === "" ||
                                        data.airline ===
                                          offer.itineraries[0].segments[0]
                                            .carrierCode) &&
                                      data.type === "F" &&
                                      (data.trip === "" ||
                                        data.trip === trip) &&
                                      (data.cabin === "" ||
                                        data.cabin === cabin) &&
                                      (data.class === "" ||
                                        data.class === flightclass) &&
                                      (data.stops === "" ||
                                        data.stops === stops) &&
                                      (data.origin === "" ||
                                        data.origin ===
                                          location.state.details.origin) &&
                                      (data.destination === "" ||
                                        data.destination ===
                                          location.state.details
                                            .destination) ? (
                                        <li>
                                          {data.class == "" ? (
                                            <div>
                                              <h3 id="a">
                                                Fixed Price (No Class or Class
                                                Mismatch)
                                              </h3>
                                              {(
                                                parseFloat(
                                                  offer.travelerPricings[0]
                                                    .price.total
                                                ) -
                                                parseFloat(data.markup_value)
                                              ).toFixed(2)}
                                            </div>
                                          ) : data.class === flightclass ? (
                                            <div>
                                              <h3>Fixed Price (Class match)</h3>
                                              {(
                                                parseFloat(
                                                  offer.travelerPricings[0]
                                                    .price.total
                                                ) -
                                                parseFloat(data.markup_value)
                                              ).toFixed(2)}
                                            </div>
                                          ) : null}
                                        </li>
                                      ) : (data.airline === "" ||
                                          data.airline ===
                                            offer.itineraries[0].segments[0]
                                              .carrierCode) &&
                                        data.type === "P" &&
                                        (data.trip === "" ||
                                          data.trip === trip) &&
                                        (data.cabin === "" ||
                                          data.cabin === cabin) &&
                                        (data.class === "" ||
                                          data.class === flightclass) &&
                                        (data.stops === "" ||
                                          data.stops === stops) &&
                                        (data.origin === "" ||
                                          data.origin ===
                                            location.state.details.origin) &&
                                        (data.destination === "" ||
                                          data.destination ===
                                            location.state.details
                                              .destination) ? (
                                        <li>
                                          <h3>Percentage Price</h3>
                                          {(
                                            parseFloat(
                                              offer.travelerPricings[0].price
                                                .total
                                            ) -
                                            (parseFloat(data.markup_value) /
                                              100) *
                                              parseFloat(
                                                offer.travelerPricings[0].price
                                                  .total
                                              )
                                          ).toFixed(2)}
                                          <br />
                                        </li>
                                      ) : (
                                        <li></li>
                                      )}
                                    </ul>
                                  </div>
                                );
                              })}

                              <button
                                key={index}
                                onClick={() => handleDataSelection(index)}
                                className="btn btn_theme-sec btn_md-sec"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="show-details">
                            
                            <h6
                              className="btn mybtn"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapseExample${index}`}
                              aria-expanded={isOpenArray[index]}
                              aria-controls={`collapseExample${index}`}
                              onClick={() => toggleItem(offer, index)}
                            >
                              Flight Details{" "}
                              <i
                                className={`fas ${
                                  chevronVisibleArray[index]
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              />
                            </h6>
                            {/* //   );
// })} */}
                            <>
                              {/* Button trigger modal */}
                              &nbsp;
                              <button
                                type="button"
                                className="btn mybtn"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                              >
                                Cancellation Policy
                              </button>
                              {/* Modal */}
                              <div
                                className="modal fade"
                                id="exampleModal"
                                tabIndex={-1}
                                aria-labelledby="exampleModalLabel"
                                aria-hidden="true"
                              >
                                <div className="modal-dialog">
                                  <div className="modal-content">
                                    <div className="modal-header myrefund-modal">
                                      <h5
                                        className="modal-title myrefund-modal"
                                        id="exampleModalLabel"
                                      >
                                        Cancellation Policy
                                      </h5>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                      />
                                    </div>
                                    <div className="modal-body">
                                      <div className="flight_refund_policy">
                                        <ol className="refund-policy-ul">
                                          <li className="">
                                            Passengers can cancel the
                                            reservation within 4 hours of
                                            booking without any charges.
                                          </li>
                                          <li className="">
                                            Passengers need to call our 24*7
                                            customer care center to request the
                                            cancellation.
                                          </li>
                                          <li className="">
                                            Passengers will receive the refund
                                            amount within 5-10 working days
                                            (Depending upon Airline policies)
                                          </li>
                                          <li>
                                            Some Airlines will provide future
                                            credits, so passengers can utilize
                                            the same for future travel.
                                          </li>
                                          <li>
                                            Passengers are able to use their
                                            future credits exclusively through
                                            the agency.
                                          </li>
                                          <li>
                                            Agency fees are non-refundable in
                                            case of cancellation.
                                          </li>
                                        </ol>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                            <>
                              {/* Button trigger modal */}
                              &nbsp;
                              <button
                                type="button"
                                className="btn mybtn"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModalbag"
                              >
                                Baggage
                              </button>
                              {/* Modal */}
                              <div
                                className="modal fade"
                                id="exampleModalbag"
                                tabIndex={-1}
                                aria-labelledby="exampleModalLabel"
                                aria-hidden="true"
                              >
                                <div className="modal-dialog">
                                  <div className="modal-content">
                                    <div className="modal-header myrefund-modal">
                                      <h5
                                        className="modal-title myrefund-modal"
                                        id="exampleModalLabel"
                                      >
                                        Baggage Information
                                      </h5>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                      />
                                    </div>
                                    <div className="modal-body">
                                      <table class="table">
                                        <thead>
                                          <tr>
                                            <th scope="col">Sector/Flight</th>
                                            <th scope="col">
                                              Checkin Baggage{" "}
                                            </th>
                                            <th scope="col">Cabin Baggage</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {apiData.data &&
                                            apiData.data.some(
                                              (item) =>
                                                item.itineraries &&
                                                item.itineraries.length > 0
                                            ) && (
                                              <tr>
                                                <td>
                                                  {
                                                    location.state.allTripDetails
                                                      .origin
                                                  }{" "}
                                                  -{" "}
                                                  {
                                                    location.state.allTripDetails
                                                      .destination
                                                  }
                                                </td>
                                                <td>Pieces: 0</td>
                                                <td>7 Kg (Adult)</td>
                                              </tr>
                                            )}

                                          {apiData.data &&
                                            apiData.data.some(
                                              (item) =>
                                                item.itineraries &&
                                                item.itineraries.length > 1
                                            ) && (
                                              <tr>
                                                <td>
                                                  {
                                                    location.state.allTripDetails
                                                      .destination
                                                  }{" "}
                                                  -{" "}
                                                  {
                                                    location.state.allTripDetails
                                                      .origin
                                                  }
                                                </td>
                                                <td>Pieces: 0</td>
                                                <td>7 Kg (Adult)</td>
                                              </tr>
                                            )}
                                        </tbody>
                                      </table>
                                      <div className="bagged-para">
                                        <p>
                                          1. The information presented above is
                                          as obtained from the airline
                                          reservation system.
                                        </p>
                                        <p>
                                          2. The baggage allowance may vary
                                          according to stop-overs, connecting
                                          flights and changes in airline rules.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          </div>
                        </div>
                        <div
                          className={`row flight_policy_refund-d result-show-row collapse${
                            isOpenArray[index] ? " show" : ""
                          }`}
                          id={`collapseExample${index}`}
                        >
                          {/* second end box */}
                          <div className="col-md-12">
                            {/* show more start */}

                            <div className="flight_policy_refund-show-more submit-seg-d">
                              {/* dropdown menu */}
                              {offer.itineraries.map(
                                
                                (itinerary, itineraryIndex) => (

                                  


                                  <div
                                    key={itineraryIndex}
                                    className="flight_show_down_wrapper row"
                                    style={{ marginBottom: "0.2rem" }}
                                  >
                                    {itinerary.segments.map(
                                      
                                      (segment, segmentIndex) => {


                                        
                                        

                                        
                                        const departureAtTime =
                                          segment.departure.at;
                                        const departureTime = new Date(departureAtTime);

                                        // let send = segment.departure.iataCode

                                        // Format departure time
                                        const formattedDepartureTimeShow =
                                          formatTime(departureTime);

                                        const arrivalAtTime =
                                          segment.arrival.at;
                                        const arrivalTime = new Date(
                                          arrivalAtTime
                                        );

                                        // Format arrival time
                                        const formattedArrivalTimeShow =
                                          formatTime(arrivalTime);

                                        function formatTime(time) {
                                          const hours = time.getHours();
                                          const minutes = time.getMinutes();
                                          const ampm =
                                            hours >= 12 ? "PM" : "AM";

                                          // Convert hours from 24-hour format to 12-hour format
                                          const formattedHours =
                                            ((hours + 11) % 12) + 1;
                                          const formattedMinutes = minutes
                                            .toString()
                                            .padStart(2, "0");

                                          const formattedTime = `${formattedHours
                                            .toString()
                                            .padStart(
                                              2,
                                              "0"
                                            )}:${formattedMinutes} ${ampm}`;

                                          return formattedTime;
                                        }

                                        const formattedDepartureDate =
                                          formatDate(segment.departure.at);
                                        const formattedArrivalDate = formatDate(
                                          segment.arrival.at
                                        );
                                        const ansDate = formattedDepartureDate; // Use the formatted departure time
                                        const ans1Date = formattedArrivalDate; // Use the formatted arrival time

                                        const seg = segment.carrierCode;
                                        const flightname =
                                          apiData.dictionaries.carriers[seg];

                                        const sefaricraft =
                                          segment.aircraft.code;
                                        const ariNumner =
                                          apiData.dictionaries.aircraft[
                                            sefaricraft
                                          ];
                                        //// code of layout duration
                                        const seg1hour =
                                          itinerary.segments[0].duration
                                            .slice(2) // Remove "pt" prefix
                                            .slice(0, 2)
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ");
                                        const seg2hour =
                                          itinerary?.segments[1]?.duration
                                            .slice(2) // Remove "pt" prefix
                                            .slice(0, 2)
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ");
                                        const seg1min =
                                          itinerary?.segments[0]?.duration
                                            .slice(2) // Remove "pt" prefix
                                            .slice(-3)
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ");
                                        const seg2min =
                                          itinerary?.segments[1]?.duration
                                            .slice(2) // Remove "pt" prefix
                                            .slice(-3)
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ");
                                        const datadurationhour =
                                          itinerary.duration
                                            .slice(2) // Remove "pt" prefix
                                            .slice(0, 2)
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ");
                                        const datadurationmin =
                                          itinerary.duration
                                            .slice(2) // Remove "pt" prefix
                                            .slice(-3)
                                            .match(/.{1,2}/g) // Split the string into groups of two characters
                                            .join(" ");
                                        // Convert hours and minutes to integers
                                        const intSeg1hour = parseInt(
                                          seg1hour,
                                          10
                                        );
                                        const intSeg2hour = parseInt(
                                          seg2hour,
                                          10
                                        );
                                        const intSeg1min = parseInt(
                                          seg1min,
                                          10
                                        );
                                        const intSeg2min = parseInt(
                                          seg2min,
                                          10
                                        );
                                        const intdatadurationhour = parseInt(
                                          datadurationhour,
                                          10
                                        );
                                        const intdatadurationmin = parseInt(
                                          datadurationmin,
                                          10
                                        );

                                        // Calculate total hours and minutes
                                        let totalHours =
                                          intSeg1hour + intSeg2hour;
                                        let totalMins = intSeg1min + intSeg2min;

                                        // Calculate the difference in hours and minutes
                                        let totalHour =
                                          intdatadurationhour - totalHours;
                                        let totalMin =
                                          intdatadurationmin - totalMins;

                                        // Adjust for negative minutes
                                        if (totalMin < 0) {
                                          totalHour -= 1; // Subtract one hour to compensate for negative minutes
                                          totalMin += 60; // Add 60 minutes to make the minutes positive
                                        }

                                        // Handle the case where minutes equal 60
                                        if (totalMin === 60) {
                                          totalHour += 1; // Add 1 hour
                                          totalMin = 0; // Reset minutes to 0
                                        }

                                        if (totalMin <= 0 || isNaN(totalMin)) {
                                          totalMin = 0; // Set minutes to 0 if it's less than or not a number
                                        }
                                        if (
                                          totalHour <= 0 ||
                                          isNaN(totalHour)
                                        ) {
                                          totalHour = 0; // Set minutes to 0 if it's less than or not a number
                                        }

                                        // Format the total duration
                                        let gethour =
                                          totalHour < 10
                                            ? "0" + totalHour + "H"
                                            : totalHour + "H";
                                        let getmin =
                                          totalMin < 10
                                            ? "0" + totalMin + "M"
                                            : totalMin + "M";
                                        let totalduration =
                                          "Layover Time: " +
                                          gethour +
                                          " " +
                                          getmin;

                                        if (totalMin <= 0 || isNaN(totalMin)) {
                                          totalMin = 0; // Set minutes to 0 if it's less than or not a number
                                        }
                                        if (totalMin === 0 && totalHour === 0) {
                                          totalduration = "";
                                        }

                                        // console.log("totalduration",totalduration);

                                        // const accessToken = 'YOUR_ACCESS_TOKEN_HERE'; // Replace with your actual access token
                                        const iataCode =
                                          segment.departure.iataCode; // Assuming you have the correct segment data
                                        // console.log("myiatacode", iataCode)

                                        // const headers = {
                                        //   Authorization: `Bearer ${accessToken}`,
                                        // };

                                        // const airlineNameD = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${iataCode}`;

                                        // axios.get(airlineNameD, { headers })
                                        //   .then((response) => {
                                        //     console.log("Airport data:", response.data);
                                        //     // Further processing or setting state with the received data
                                        //   })
                                        //   .catch((error) => {
                                        //     console.error('Error fetching airport data:', error);
                                        //   });
                                        const content =
                                          itineraryIndex === 0
                                            ? "Out bound"
                                            : itineraryIndex === 1
                                            ? "In bound"
                                            : "Not Available";

                                        return (
                                          <>
                                            <div
                                              key={segmentIndex}
                                              className="flight-shoe_dow_item submit-seg-bor col-md-12"
                                            >
                                              <div className="airline-details">
                                                <span className="airlineName fw-500">
                                                  {flightname} |
                                                </span>
                                                <span className="flightNumber">
                                                  {location.state.allTripDetails.cabin}{" "}
                                                  | {ariNumner} |{" "}
                                                  {segment.carrierCode}
                                                  &nbsp;
                                                  {segment.number}
                                                </span>
                                              </div>
                                              <div className="flight_inner_show_component row">
                                                <div className="flight_det_wrapper col-md-5">
                                                  <div className="flight_det">
                                                    <div className="code_time">
                                                      <span className="code">
                                                        {
                                                          segment.departure
                                                            .iataCode
                                                        }
                                                      </span>
                                                      {/* {airlineNameD} */}
                                                      <span className="time">
                                                        {
                                                          formattedDepartureTimeShow
                                                        }
                                                        
                                                      </span>
                                                    </div>
                                                    {Object.entries(countryNames).map(([iatadeparture, countryName]) => {
  if (segment.departure.iataCode === iatadeparture) {
    return (
      <p key={iatadeparture}>
{countryName.split('/')[0]}      </p>
    );
  }
  return null; // If the condition doesn't match, return null or an empty fragment
})}

                                                    <p className="date">
                                                      {ansDate}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="flight_duration col-md-2">
                                                  <span>{content}</span><br/>
                                                  {/* <div className="arrow_right" /> */}
                                                  <div className="air-arrow show-air-arro">&#x2708;</div>
                                                  <div className="show-d-arr">
                                                    <b>
                                                      {segment.duration
                                                        .slice(2) 
                                                        .match(/.{1,2}/g) 
                                                        .join(" ")}
                                                    </b>
                                                  </div>
                                                  
                                                </div>
                                                <div className="flight_det_wrapper col-md-5">
                                                  <div className="flight_det myserach-res">
                                                    <div className="code_time">
                                                      <span className="code">
                                                        {
                                                          segment.arrival
                                                            .iataCode
                                                        }
                                                      </span>
                                                      {/* <GetFullName origin={segment.arrival.iataCode}/> */}
                                                      <span className="time">
                                                        {
                                                          formattedArrivalTimeShow
                                                        }
                                                      </span>
                                                    </div>
                                                    {Object.entries(countryNames).map(([iataarrival, countryName]) => {
  if (segment.arrival.iataCode === iataarrival) {
    return (
      <p key={iataarrival}>
{countryName.split('/')[0]}      </p>
    );
  }
  return null; // If the condition doesn't match, return null or an empty fragment
})}

                                                    <p className="date">
                                                      {ans1Date}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div
                                                  className="col-md-12"
                                                  id="totalDurationElement"
                                                >
                                                  <center className="cen-layover">
                                                    <h5>
                                                      {/* Only display totalduration if it hasn't been displayed before */}
                                                      {segmentIndex === 0 ? (
                                                        <span className="layover">
                                                          {totalduration}
                                                        </span>
                                                      ) : (
                                                        ""
                                                      )}
                                                    </h5>
                                                  </center>
                                                </div>
                                              </div>
                                            </div>
                                          </>
                                        );
                                      }
                                    )}
                                  </div>
                                )
                              )}

                              {/* end code of segment 2  */}
                            </div>

                            {/* show more end */}
                          </div>
                        </div>
                        {/* row end above */}
                      </div>
                    );
                  })}
              {/* <div className="load_more_flight">
                <button className="btn btn_md">
                  <i className="fas fa-spinner" /> Load more..
                </button>
              </div> */}
              {apiData.data.length > displayedResults && (
                <div className="load_more_flight">
                  <button className="btn btn_md" onClick={loadMoreResults}>
                    <i className="fas fa-spinner" /> Load More
                  </button>
                </div>
              )}

              {/* row end */}
            </div>
            {/* col-end */}
          </div>
        </div>
      </section>
    </>
  );
};

export default FlightResult;
