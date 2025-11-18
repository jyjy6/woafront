<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5"
            >AI with Tools (Calculator)</v-card-title
          >
          <v-card-subtitle
            >Ask a question that requires calculation (e.g., 'What is 25 *
            4?').</v-card-subtitle
          >
          <v-divider></v-divider>

          <v-card-text
            ref="chatContainer"
            style="height: 60vh; overflow-y: auto"
          >
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['chat-row', msg.from === 'user' ? 'user-row' : 'ai-row']"
            >
              <div :class="['bubble', msg.from]">
                {{ msg.text }}
              </div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-text-field
              v-model="newMessage"
              label="Ask something..."
              variant="solo-filled"
              @keyup.enter="sendMessage"
              hide-details
              ref="messageInput"
            ></v-text-field>
            <v-btn
              class="ml-2"
              icon="mdi-send"
              color="primary"
              @click="sendMessage"
              :loading="loading"
              :disabled="!newMessage.trim()"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, watch, nextTick } from "vue";

const newMessage = ref("");
const messages = ref([]);
const loading = ref(false);
const config = useRuntimeConfig();
const messageInput = ref(null);
const chatContainer = ref(null);

onMounted(() => {
  console.log(config.public.apiBase);
  if (messageInput.value) {
    messageInput.value.focus();
  }
});

watch(
  messages,
  () => {
    nextTick(() => {
      const container = chatContainer.value;
      if (container && container.$el) {
        container.$el.scrollTop = container.$el.scrollHeight;
      }
    });
  },
  { deep: true }
);

const sendMessage = async () => {
  if (!newMessage.value.trim() || loading.value) return;

  const userMessage = { from: "user", text: newMessage.value };
  messages.value.push(userMessage);
  const messageToSend = newMessage.value;
  newMessage.value = "";
  loading.value = true;

  try {
    const response = await axios.post(`${config.public.apiBase}/admin/chat`, {
      message: messageToSend,
    });

    messages.value.push({ from: "ai", text: response.data });
  } catch (err) {
    messages.value.push({ from: "ai", text: "Sorry, an error occurred." });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.chat-row {
  display: flex;
  margin: 8px 0;
}

.user-row {
  justify-content: flex-end;
}

.ai-row {
  justify-content: flex-start;
}

.bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* User 말풍선 (파란색) — ChatGPT 사용자 스타일 */
.bubble.user {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

/* AI 말풍선 (밝은 회색) — ChatGPT Assistant 스타일 */
.bubble.ai {
  background: #f3f4f6;
  color: #111;
  border-bottom-left-radius: 4px;
}
</style>
