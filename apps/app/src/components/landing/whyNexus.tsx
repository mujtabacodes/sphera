import { FlexColStart, FlexColStartBtw, FlexRowStartCenter } from "../Flex";
import { Boxes } from "../icons";

const whySphera = [
  // {
  //   name: "call-protection",
  //   title: "Call Protection",
  //   description:
  //     "With Sphera, all unknown and scam calls are answered by our AI agents, runs series of questions with the caller, ensuring that you get only the calls that matter.",
  //   img: "/assets/images/anti-theft-system.svg",
  // },
  // {
  //   name: "sales",
  //   title: "AI-enhanced Sales",
  //   description:
  //     "Sphera AI agents are trained to handle sales calls, they can answer questions, provide information, place customer appointments and even close deals.",
  //   img: "/assets/images/help-desk.svg",
  // },
  {
    name: "chatbot",
    title: "24/7 Chatbot Support",
    description:
      "Our AI-driven chatbot is available 24/7 to provide instant, accurate responses and escalate complex issues to human agents when necessary.",
    img: "/assets/images/chatbot.svg",
  },
];

export default function WhySphera() {
  return (
    <FlexColStart className="w-full h-auto bg-white-100 py-[8em] px-[5em] rounded-[20px] mb-4 ">
      <a id="why-sphera"></a>
      <FlexRowStartCenter className="w-auto px-4 py-2 rounded-lg border-[.5px] border-white-400/30 text-white-400 text-sm font-ppReg">
        <Boxes size={20} className="stroke-white-400" />
        Why Sphera
      </FlexRowStartCenter>

      <FlexColStart className="w-full">
        <h1 className="text-[3em] font-ppSB text-brown-102">
        Secure Every Chat, Expand Your AI Knowledge Base
        </h1>
        <p className="text-brown-102 text-sm font-ppL max-w-[70%]">
        Sphera enhances communication with AI-powered chat capabilities, secure data protection, and 24/7 customer support in a single, streamlined platform.
        </p>
      </FlexColStart>

      <FlexRowStartCenter className="w-full h-auto mt-[8em] gap-10">
        {whySphera.map((feature) => (
          <FlexColStartBtw
            key={feature.name}
            className="w-[400px] h-auto rounded-[15px] border-[1px] border-white-400/20 p-8 grayscale transition-all hover:grayscale-0"
          >
            <img src={feature.img} alt={feature.name} width={40} />
            <h1 className="text-[1.2em] font-ppSB font-extrabold text-brown-103">
              {feature.title}
            </h1>
            <p className="text-white-400 text-sm font-ppReg">
              {feature.description}
            </p>
          </FlexColStartBtw>
        ))}
      </FlexRowStartCenter>
    </FlexColStart>
  );
}
