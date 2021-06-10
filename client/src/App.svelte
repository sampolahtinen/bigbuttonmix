<script lang="ts">
  import { onMount } from "svelte";
  import { getRandomMixtape } from "./api";

  import BigButton from "./components/BigButton.svelte";
  import Dropdown from "./components/Dropdown.svelte";
  import { countryOptions } from "./constants";
  import { generateCityOptions } from "./utils";
  let name: string;
  let userCity: string;
  let scEmbedCode: boolean;
  let cityDropdownOptions = generateCityOptions(countryOptions as any);

  const getScEmbedCode = async () => {
    console.log("fetching");
    // const response = await fetch("https://swapi.dev/api/people/1");
    const response = (await fetch(
      "http://localhost:4000/api/random-mix"
    )) as any;
    console.log(response);
    const { html } = await response.json();
    console.log(html);
    scEmbedCode = html;

    // const iframeElement = new DOMParser().parseFromString(html, "text/html");
    // console.log(iframeElement);
  };

  const handleCitySelection = ({ detail }) => console.log(detail);
</script>

<main>
  <div class="full-width-container">
    {#if scEmbedCode}
      <div class="soundcloud-embedded-player">
        {@html scEmbedCode}
      </div>
    {/if}
    <BigButton on:click={getScEmbedCode} isSmall={scEmbedCode} />
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

  main {
    position: relative;
    display: block;
    width: 100vw;
    height: 100vh;
    text-align: center;
    margin: 0;
    max-width: 500px;
  }

  .copyright {
    font-size: 10px;
    align-self: flex-end;
    position: absolute;
    bottom: 0;
    right: 50%;
  }

  .full-width-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    max-width: 500px;
    background-image: radial-gradient(
      circle,
      #f1e2e7,
      #f1a9d2,
      #de72ce,
      #b43cd8,
      #5c12eb
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
