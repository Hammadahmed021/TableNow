import React, { useState, useEffect } from "react";
import { SelectOption, Button, Loader } from "./index";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { dataForFilter } from "../utils/Api";

const Filter = ({ onFilterChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    kitchens: [], // Default to "All Kitchens"
    facilities: [], // Default to "All Facilities"
    areas: [], // Default to "All Areas"
    person: [], // No default for person
    startTime: "",
    endTime: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const showFilter = async () => {
      setLoading(true);
      try {
        const response = await dataForFilter("data-for-filter");
        setData(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    showFilter();
  }, []);

  const handleFilterChange = (e, category) => {
    const value = Array.isArray(e.target.value)
      ? e.target.value
      : [e.target.value]; // Ensure it's an array

    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [category]: value,
    }));

    // Pass the empty array for filtering if "All" is selected
    onFilterChange({
      ...selectedOptions,
      [category]: value.includes() ? [] : value,
    });
  };

  // const handleTimeChange = (e, isStartTime) => {
  //   const value = e.target.value;
  //   let newEndTime = selectedOptions.endTime;

  //   if (isStartTime) {
  //     const [hours, minutes] = value.split(":").map(Number);
  //     const newHours = (hours + 1) % 24;
  //     newEndTime = `${newHours.toString().padStart(2, "0")}:${minutes
  //       .toString()
  //       .padStart(2, "0")}:00`;

  //     setSelectedOptions((prevSelectedOptions) => ({
  //       ...prevSelectedOptions,
  //       startTime: value === "" ? "--:--" : value,
  //       endTime: newEndTime,
  //     }));
  //   } else {
  //     setSelectedOptions((prevSelectedOptions) => ({
  //       ...prevSelectedOptions,
  //       endTime: value,
  //     }));
  //   }
  // };

  const handleTimeChange = (e, isStartTime) => {
    const value = e.target.value;
  
    // If "--:--" is selected, reset both start and end times to "--:--"
    if (value === "") {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        startTime: "",
        endTime: "",  // Reset end time as well if no valid time is selected
      }));
      return;
    }
  
    // If a valid time is selected
    if (isStartTime) {
      const [hours, minutes] = value.split(":").map(Number);
      const newHours = (hours + 1) % 24;  // Increment the hour for end time calculation
      const newEndTime = `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00`;
  
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        startTime: value,
        endTime: newEndTime,  // Automatically set the new end time
      }));
    } else {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        endTime: value,
      }));
    }
  };
  

  const handleSearch = () => {
    const filters = {
      kitchens: selectedOptions.kitchens.includes("all") ? [] : selectedOptions.kitchens,
      facilities: selectedOptions.facilities.includes("all") ? [] : selectedOptions.facilities,
      areas: selectedOptions.areas.includes("all") ? [] : selectedOptions.areas,
      person: selectedOptions.person,
      startTime: selectedOptions.startTime,
      endTime: selectedOptions.endTime,
    };
    navigate("/listing", { state: { filters } });
  };

  if (loading)
    return (
      <p>
        <Loader />
      </p>
    );

    const personOptions = [
      { id: 0, name: "Any Person" }, // First option for "Any Person"
      { id: 1, name: "1" },
      { id: 2, name: "2" },
      { id: 3, name: "3" },
      { id: 4, name: "4" },
      { id: 5, name: "5" },
      { id: 6, name: "6" },
      { id: 7, name: "7" },
      { id: 8, name: "8" },
    ];

  // const generateTimeOptionsWithAMPM = () => {
  //   const options = [];
  
  //   const formatTime = (hours, minutes) => {
  //     const period = hours >= 12 ? "PM" : "AM";
  //     const adjustedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
  //     const displayTime = `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  //     const valueTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  //     return {
  //       id: valueTime,
  //       name: displayTime,
  //     };
  //   };
  
  //   // Add --:-- as the first option
  //   options.push({
  //     id: "",
  //     name: "--:--",
  //   });
  
  //   for (let hour = 0; hour < 24; hour++) {
  //     for (let minute = 0; minute < 60; minute += 15) {
  //       options.push(formatTime(hour, minute));
  //     }
  //   }
  
  //   return options;
  // };
  const generateTimeOptionsIn24HourFormat = () => {
    const options = [];
  
    // Add --:-- as the first option
    options.push({
      id: "",
      name: "--:--",
    });
  
    // Generate time options in 24-hour format
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const displayTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`; // 24-hour format
        const valueTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
        options.push({
          id: valueTime,
          name: displayTime,
        });
      }
    }
  
    return options;
  };
  
  
  

  const timeOptions = generateTimeOptionsIn24HourFormat();

  const addAllOption = (options, label) => [
    { id: "all", name: label },
    ...options,
  ];

  return (
    <div className="flex">
      <div className="flex items-center border rounded-lg p-2">
        <SelectOption
          label="Kitchens"
          value={selectedOptions.kitchens}
          onChange={(e) => handleFilterChange(e, "kitchens")}
          className="border-r-2 pr-1 mx-5"
          options={addAllOption(data?.kitchens || [], "All Kitchens")}
        />
        <SelectOption
          label="Areas"
          value={selectedOptions.areas}
          onChange={(e) => handleFilterChange(e, "areas")}
          className="border-r-2 pr-1 mx-5"
          options={addAllOption(data?.areas || [], "All Areas")}
        />
        <SelectOption
          label="Facilities"
          value={selectedOptions.facilities}
          onChange={(e) => handleFilterChange(e, "facilities")}
          className="border-r-2 pr-1 mx-5"
          options={addAllOption(data?.facilities || [], "All Facilities")}
        />
        <SelectOption
          label="Persons"
          value={selectedOptions.person}
          onChange={(e) => handleFilterChange(e, "person")}
          className="border-r-2 pr-1 mx-5"
          options={personOptions}
          // options={personOptions.map(option => ({
          //   ...option,
          //   name: `${option.name}`, // Prepend "Any" to the name only for display
          // }))}
        />
        <SelectOption 
          label="Start Time"
          value={selectedOptions.startTime}
          // value={selectedOptions.startTime}
          onChange={(e) => handleTimeChange(e, true)}
          className="border-r-2 pr-1 mx-5"
          options={timeOptions}
        />
        <SelectOption
          label="End Time"
          value={selectedOptions.endTime}
          onChange={(e) => handleTimeChange(e, false)}
          options={timeOptions}
        />
      </div>
      <Button onClick={handleSearch} className="ml-2 px-8 text-xl">
        Search
      </Button>
    </div>
  );
};

export default Filter;
