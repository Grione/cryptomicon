<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown="searchCoin()"
            @keydown.enter="add()"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
        </div>
        <div
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
          v-if="symbols.length"
        >
          <span
            class="
              inline-flex
              items-center
              px-2
              m-1
              rounded-md
              text-xs
              font-medium
              bg-gray-300
              text-gray-800
              cursor-pointer
            "
            v-for="symbol in symbols"
            :key="symbol"
            @click="add(symbol)"
          >
            {{ symbol }}
          </span>
        </div>
        <div v-if="error" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add(ticker)" />
  </section>
</template>
<script>
import AddButton from "./AddButton.vue";

export default {
  data() {
    return {
      ticker: "",
      symbols: [],
    };
  },
  props: {
    allCoins: {
      type: Array,
    },
    error: Boolean,
  },
  components: {
    AddButton,
  },

  methods: {
    searchCoin() {
      this.$emit('clean-error')
      this.symbols = [];
      this.allCoins.forEach((el) => {
        const name = el.FullName.toUpperCase();
        const symbol = el.Symbol;

        if (this.symbols.length < 4 && this.ticker) {
          if (name.indexOf(this.ticker.toUpperCase()) != -1) {
            this.symbols.push(symbol);
          }
        }
      });
    },
    add() {
      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },
  },
};
</script>
