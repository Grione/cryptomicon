<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!--   <div class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">
    <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div> -->
    <div class="container">
      <add-ticker
        :allCoins="allCoins"
        :error="error"
        @add-ticker="add"
        @clean-error="cleanError"
      />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>Фильтр <input v-model="filter" /></div>
        <div>
          <button
            v-if="page > 1"
            @click="page = page - 1"
            class="
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page = page + 1"
            class="
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Вперёд
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="coin in paginatedTickers"
            :key="coin.id"
            @click="select(coin)"
            :class="{
              'border-4': selectedTicker === coin,
              'bg-red-100': !coin.type,
            }"
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ coin.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(coin.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="remove(coin)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section class="relative" v-if="selectedTicker">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <ticker-graph
          :graph="graph"
          @graph-elements="updateGraphElements"
          @click="closeGraph"
        />
      </section>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubsribeFromTicker } from "./api";
import AddTicker from "./components/AddTicker.vue";
import TickerGraph from "./components/TickerGraph.vue";

export default {
  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      error: false,
      allCoins: [],
      page: 1,
      filter: "",
      graphElements: 1,
    };
  },

  components: {
    AddTicker,
    TickerGraph,
  },

  created() {
    const tickersData = localStorage.getItem("cryptonomicon");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);

      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice, type) => {
          this.updateTicker(ticker.name, newPrice, type);
        });
      });
    }

    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((coin) =>
        coin.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  mounted() {
    fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
      .then((response) => response.json())
      .then((tickers) => {
        const result = tickers.Data;
        this.allCoins = Object.values(result);
      })
      .catch((error) => {
        alert(error);
      });
  },

  methods: {
    closeGraph() {
      this.selectedTicker = null;
      this.graph = [];
    },
    updateGraphElements(graphElements) {
      this.graphElements = graphElements;
    },
    cleanError() {
      this.error = false;
    },
    updateTicker(tickerName, price, type) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
            while (this.graph.length > this.graphElements) {
              this.graph.shift();
            }
          }
          t.price = price;
          t.type = type;
        });
    },

    select(coin) {
      this.selectedTicker = coin;
    },

    formatPrice(price) {
      if (price == "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    add(ticker) {
      const currentTicker = {
        id: ticker.toUpperCase(),
        name: ticker.toUpperCase(),
        price: "-",
      };

      let isError = this.tickers.find(
        (item) => item.name == currentTicker.name
      );

      if (isError) {
        this.error = true;
        return;
      }

      this.tickers.push(currentTicker);
      this.filter = "";

      subscribeToTicker(currentTicker.name, (newPrice, type) => {
        this.updateTicker(currentTicker.name, newPrice, type);
      });
    },

    remove(coin) {
      this.tickers = this.tickers.filter((el) => el.id != coin.id);
      if (this.selectedTicker == coin) {
        this.selectedTicker = null;
      }

      unsubsribeFromTicker(coin.name);
    },
  },
  watch: {
    selectedTicker() {
      this.graph = [];
    },

    tickers: {
      deep: true,
      handler() {
        localStorage.setItem("cryptonomicon", JSON.stringify(this.tickers));
        window.addEventListener("storage", () => {
          if (
            JSON.stringify(this.tickers) !==
            localStorage.getItem("cryptonomicon")
          ) {
            this.tickers = JSON.parse(localStorage.getItem("cryptonomicon"));
          }
        });
      },
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },
    pageStateOptions(v) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.origin}?filter=${v.filter}&page=${v.page}`
      );
    },
  },
};
</script>
<style>
@import "app.css";
</style>