"use client";

import React, { useEffect, useRef, useState } from "react";
import { Orbit } from "@uiball/loaders";
import Scores from "./Scores";
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes";

const TFTStats = () => {
  const [clicked, setClicked] = useState(false);
  const [emptyGameName, setEmptyGameName] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameTag, setGameTag] = useState("");
  const [averagePlacement, setAveragePlacement] = useState(null);
  const [last20, setLast20] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  let fetchStatsRef = useRef();

  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme])

  useEffect(() => {
    fetchStatsRef.current.removeAttribute("disabled");
  }, [apiError]);

  const handleGameNameChange = (event) => {
    setGameName(event.target.value);
  };

  const handleGameTagChange = (event) => {
    setGameTag(event.target.value);
  }

  const handleFormSubmit = (event) => {
    event.preventDefault();
    fetchTFTStats();
  }

  const fetchTFTStats = async () => {
    setAveragePlacement(null);
    setApiError(false);
    if (gameName.trim() === "" || gameTag.trim() === "") {
      setEmptyGameName(true);
      return;
    }
    else { setEmptyGameName(false); }
    if (fetchStatsRef.current) fetchStatsRef.current.setAttribute("disabled", "disabled");
    setClicked(true);
    const response = await fetch(`/api/riotApiCall?gameName=${gameName}&gameTag=${gameTag}`, {
      method: "GET",
    });
    const data = await response.json();
    if (data.error) {
      setApiError(true);
      setApiErrorMessage(data.error);
    }
    else {
      setAveragePlacement(data.avgPlacement);
      setLast20(data.last_20)
      fetchStatsRef.current.removeAttribute("disabled");
    };
  };

  return (
    <div className="lg:w-2/5 w-10/12 flex justify-center flex-col">
      <div>
        <h1 className="font-bold py-5">TFT Stats</h1>
        <form onSubmit={handleFormSubmit}>
          <div className="flex sm:flex-row flex-col pb-5 w-full items-center">
            <div className="flex flex-row w-full pb-2 sm:pb-0">
              <div className="flex-1">
                <Input type="text" value={gameName}
                  onChange={handleGameNameChange}
                  placeholder="Name"
                  className="w-full py-2 pl-3" />
              </div>
              <div className="flex flex-row flex-initial w-28">
                <span className="m-2">#</span>
                <Input type="text"
                  value={gameTag}
                  onChange={handleGameTagChange}
                  placeholder="Tag"
                  className="w-full py-2 px-2 mr-2" />
              </div>
            </div>
            <div className="w-40">
              <button ref={fetchStatsRef} onClick={fetchTFTStats} className="w-full bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline">Fetch Stats</button>
            </div>
          </div>
        </form>
      </div >
      <div>
        {
          clicked && !emptyGameName && !apiError ? (
            averagePlacement !== null && !isNaN(averagePlacement) ?
              (last20.length !== 0 ? (
                <div className="flex flex-col items-center">
                  <p>Average placement in last {last20.length} games: {averagePlacement.toFixed(2)}</p>
                  <Scores last20={last20} />
                </div>
              ) : <p>This account has no TFT matches on record</p>)
              : (
                <div className="flex justify-center">
                  <Orbit size={35} color={isDarkMode ? "white" : "#231F20"} />
                </div>
              )
          ) : null
        }
        {emptyGameName && <p className="text-red-600">Game {gameName ? 'tag' : 'name'} cannot be empty</p>}
        {apiError && <p className="text-red-600">{apiErrorMessage}</p>}
      </div>
    </div >
  );
};

export default TFTStats;