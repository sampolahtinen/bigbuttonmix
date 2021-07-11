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
  let isLoading: boolean = false;

  const getScEmbedCode = async () => {
    console.log("fetching");
    isLoading = true;
    const response = await getRandomMixtape();
    console.log(response);

    const { html } = await response.json();
    console.log(html);

    isLoading = false
    scEmbedCode = html;
    // scEmbedCode = '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/847179808&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=false&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/prokres" title="Prokres" target="_blank" style="color: #cccccc; text-decoration: none;">Prokres</a> · <a href="https://soundcloud.com/prokres/prokres-synergy-virtual-rave" title="[Synergie] -  Virtual Rave - Leftfield Weird" target="_blank" style="color: #cccccc; text-decoration: none;">[Synergie] -  Virtual Rave - Leftfield Weird</a></div>';
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
