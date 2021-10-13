<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="typescript">
  // import { onMount } from "svelte";
  import BigButton from "../components/BigButton.svelte";
  import { api } from "../api";
  // import Dropdown from "../components/Dropdown.svelte";
  // import { RaEventInfo } from '../types';
  // import { countryOptions } from '../constants";
  // import { generateCityOptions } from "../utils";

  // let name: string;
  // let userCity: string;
  // let cityDropdownOptions = generateCityOptions(countryOptions as any);
  let scEmbedCode = "";
  let raEventInformation;
  let isLoading = false;
  let errorMessage = "";
  // let scEmbedCode: string = '';
  // let raEventInformation: any = '';
  // let isLoading: boolean = false;
  // let errorMessage: string = '';

  const isStandalonePWARequest = () => {
    const isPWAiOS =
      "standalone" in window.navigator && window.navigator["standalone"];
    const isPWAChrome = window.matchMedia("(display-mode: standalone)").matches;

    return isPWAiOS || isPWAChrome;
  };


  const getCurrentWeek = () => {
    //console.log('Getting current week')
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()+1
    const day = currentDate.getDate()
    const week = `${year}-${month}-${day}`
    return week
  };

  const getScEmbedCode = async () => {
    console.log("fetching");
    isLoading = true;
    errorMessage = "";
    const isAutoPlayPossible = isStandalonePWARequest();
    
    // location is currently hard-coded
    const location = 'berlin'
    //const week = '2021-10-09'
    const week = getCurrentWeek();

    try {
      const response = await api(
        "GET",
        `random-soundcloud-track?location=${location}&week=${week}&autoPlay=${isAutoPlayPossible}`
      );
      console.log(response)
      scEmbedCode = response.body.html;
      raEventInformation = response.body;
    } catch (error) {
      errorMessage = error
      console.log(errorMessage);
    } finally {
      isLoading = false;
    }
  };

  // const handleCitySelection = ({ detail }) => console.log(detail);
</script>

<main>
  <div class="full-width-container">
    {#if scEmbedCode}
      <div class="soundcloud-embedded-player">
        {@html scEmbedCode}
        <div class="event-info-container">
          <div class="column">
            <span class="event-info-heading">Event</span>
            <a
              class="event-info-row"
              href={raEventInformation.eventLink}
              target="_blank">{raEventInformation.title}</a
            >
            <span class="event-info-heading">Venue</span>
            <a
              class="event-info-row"
              href={raEventInformation.venue}
              target="_blank">{raEventInformation.venue}</a
            >
          </div>
          <div class="column">
            <span class="event-info-heading">Date</span>
            <span class="event-info-row date">{raEventInformation.date}</span>
            <span class="event-info-row">{raEventInformation.openingHours}</span
            >
          </div>
        </div>
      </div>
    {/if}
    <BigButton on:click={getScEmbedCode} isSmall={!!scEmbedCode} {isLoading} />
    {#if errorMessage}
      <span>{errorMessage}</span>
    {/if}
    <!-- <Dropdown items={cityDropdownOptions} on:select={handleCitySelection} /> -->
    <span class="copyright">(c) Andrew Moore & Sampo Lahtinen</span>
  </div>
</main>

<style>
  :global(body) {
    padding: 0;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }
  :global(div) {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    position: relative;
  }

  @font-face {
    font-family: "FR73PixelW00-Regular";
    src: url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot");
    src: url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot?#iefix")
        format("embedded-opentype"),
      url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff2")
        format("woff2"),
      url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff")
        format("woff"),
      url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.ttf")
        format("truetype"),
      url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.svg#FR73PixelW00-Regular")
        format("svg");
  }

  :global(*) {
    font-family: "FR73PixelW00-Regular";
  }

  main {
    position: relative;
    display: block;
    width: 100vw;
    height: 100vh;
    text-align: center;
    margin: 0;
    max-width: 500px;
  }

  .event-info-container {
    display: flex;
    padding: 16px;
    background-color: hsl(231deg 24% 15%);
    text-align: left;
  }

  .event-info-heading {
    display: block;
    color: white;
    opacity: 0.7;
    font-size: 8px;
    font-weight: 200;
  }
  .event-info-row {
    text-decoration: none;
    color: white;
    font-size: 10px;
    text-align: left;
    margin-bottom: 16px;
  }

  .event-info-row.date {
    display: block;
    white-space: nowrap;
    margin-bottom: 0;
  }

  .copyright {
    font-size: 8px;
    align-self: flex-end;
    position: absolute;
    bottom: 0;
    right: 0;
    color: white;
    opacity: 0.6;
    white-space: nowrap;
  }

  .full-width-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
    height: 100vh;
    max-width: 500px;
    background-image: linear-gradient(
      to bottom,
      #12151f,
      #121521,
      #121524,
      #121526,
      #121528
    );
  }

  .soundcloud-embedded-player {
    width: 100%;
    margin-bottom: 1rem;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }

    .full-width-container {
      margin: auto;
      max-width: 500px;
    }
  }
</style>
