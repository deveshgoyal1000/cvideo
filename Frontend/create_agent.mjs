import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({ apiKey: "sk_6070fada236e6ba630046041ef46759e3e8a2742a2c67c1b" });

async function createAgent() {
  try {
    const agent = await elevenlabs.conversationalAi.agents.create({
      name: "Priya - Hair Salon Receptionist",
      conversation_config: {
        agent: {
          prompt: {
            prompt: "You are Priya, the warm and friendly virtual receptionist for Elite Hair Salon. You speak naturally like a real person — not like a robot or a digital assistant. Help customers book, reschedule, or cancel hair salon appointments. Answer questions about services, prices, and availability. Always be warm, welcoming, and professional. Keep all responses SHORT — 1 to 3 sentences max.",
          },
          first_message: "Hi there! I'm Priya from Elite Hair Salon. How can I help you today?",
          language: "en"
        },
        tts: {
          voice_id: "21m00Tcm4TlvDq8ikWAM" // Rachel
        }
      },
    });
    console.log("AGENT_CREATED:", agent.agent_id);
  } catch (error) {
    console.error("Failed to create agent:", error);
  }
}

createAgent();
