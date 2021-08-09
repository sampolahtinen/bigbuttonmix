<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="typescript">
  import { onMount } from "svelte";
  import BigButton from "../components/BigButton.svelte";
  import Dropdown from "../components/Dropdown.svelte";
  // import { countryOptions } from '../constants";
  import { generateCityOptions } from "../utils";
  import { api } from '../api'

  let name: string;
  let userCity: string;
  // let cityDropdownOptions = generateCityOptions(countryOptions as any);
  let scEmbedCode: boolean;
  let isLoading: boolean = false;

  const getScEmbedCode = async () => {
    console.log("fetching");
    isLoading = true;
    // const response = await fetch('/api/random-soundcloud-track')
    const response = await api('GET', 'random-soundcloud-track')

    const { html } = response.body;
    console.log(html);

    isLoading = false
    scEmbedCode = html;
  };

  

  const handleCitySelection = ({ detail }) => console.log(detail);
</script>

<main>
  <div class="full-width-container">
    <!-- <Header /> -->
    {#if scEmbedCode}
      <div class="soundcloud-embedded-player">
        {@html scEmbedCode}
      </div>
    {/if}
    <BigButton on:click={getScEmbedCode} isSmall={scEmbedCode} isLoading={isLoading} />
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
    font-family: "FR73PixelW00-Regular"; src: url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot"); src: url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot?#iefix") format("embedded-opentype"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff2") format("woff2"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff") format("woff"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.ttf") format("truetype"), url("//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.svg#FR73PixelW00-Regular") format("svg");
  }

  :global(*) {
    font-family: 'FR73PixelW00-Regular';
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
    background-image: linear-gradient(to bottom, #12151f, #121521, #121524, #121526, #121528);
    /* background-image: radial-gradient(
      circle,
      #f1e2e7,
      #f1a9d2,
      #de72ce,
      #b43cd8,
      #5c12eb
    ); */
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