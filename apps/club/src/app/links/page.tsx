import BackgroundSvgs from './_components/assets/background-svgs';
import BlankCalendarSVG from './_components/assets/blank-calendar';
import ChatBubbleSVG from './_components/assets/chat-bubble';
import LaptopChargingSVG from './_components/assets/laptop-charging';
import Button from './_components/button';
import LinksHeader from './_components/links-header';

export default function links() {
  return (
    <div className="h-auto w-screen overflow-hidden bg-[#0F172A] min-h-screen">

      {/* Background SVGs */}
      <div className='relative z-0'>
        <BackgroundSvgs />
        
        {/* Left-side SVGs */}
        <svg className="absolute lg:top-[-130px] top-[-82px] lg:w-[780px] w-[420px] lg:h-[380px] h-[250px] left-0" viewBox="0 0 1167 500" overflow="visible">
          <use href="#binary-icon" />
        </svg>

        <svg className="absolute lg:top-[80px] top-[-80px] lg:w-[310px] w-[180px] lg:left-[210px] left-0" overflow="visible" width="559" height="594" viewBox="0 0 559 594">
          <use href="#abstract-shape-left-1" />
        </svg>

        <svg className="absolute lg:top-[60px] top-[-80px] lg:w-[300px] w-[180px] left-0" overflow="visible" width="691" height="1156" viewBox="0 0 691 1156">
          <use href="#tk-neon" />
        </svg>

        <svg className="absolute top-[150px] lg:w-[310px] w-[180px] lg:left-[250px] left-0" overflow="visible" width="735" height="1004" viewBox="0 0 735 1004">
          <use href="#tk-neon-sign" />
        </svg>

        <svg className="absolute lg:top-[640px] top-[540px] lg:w-[380px] w-[180px] lg:left-[340px] left-0" overflow="visible" width="849" height="430" viewBox="0 0 849 430">
          <use href="#abstract-shape-left-2" />
        </svg>

        {/* Right-side SVGs */}

        <svg className="absolute lg:top-[-200px] top-[-280px] right-0 lg:w-[330px] w-[180px]" overflow="visible" width="525" height="748" viewBox="0 0 525 748">
          <use href="#abstract-shape-right-1" />
        </svg>

        <svg className="absolute top-[-870px] lg:right-[450px] right-[15px] lg:w-[700px] w-[400px]" overflow="visible" width="1440" height="2746" viewBox="0 0 1440 2746">
          <use href="#terminal-icon" />
        </svg>

        <svg className="absolute lg:top-[510px] top-[360px] lg:right-[160px] right-[10px] lg:w-[220px] w-[80px]" overflow="visible" width="235" height="493" viewBox="0 0 235 493">
          <use href="#abstract-shape-right-2" />
        </svg>

        <svg className="absolute lg:top-[170px] top-[-90px] lg:right-[430px] right-[-80px] w-[240px] lg:w-[480px]" transform="scale(-1,1)" overflow="visible" width="926" height="1740" viewBox="0 0 926 1740">
          <use href="#sword" />
        </svg>
      </div>

      {/* Header */}
      <LinksHeader />

      {/* Buttons */}
      <main className="relative z-10 px-8 py-14 mt-10 flex justify-center items-center flex-col">
        <div className="flex flex-col gap-y-12 md:gap-y-20 w-[max-content] items-stretch justify-center [&_*]:h-16 [&_*]:md:h-24 [&_*]:justify-center">
          <Button href="https://discord.knighthacks.org" target="_blank" rel="noopener noreferrer" icon={ChatBubbleSVG}>Join the Discord!</Button>
          <Button href="https://calendar.google.com/calendar/embed?src=c_0b9df2b0062a5d711fc16060ff3286ef404b174bfafc4cbdd4e3009e91536e94%40group.calendar.google.com&ctz=America%2FNew_York" target="_blank" rel="noopener noreferrer" icon={BlankCalendarSVG}>KnightHacks Calendar</Button>
          <Button href="https://instagram.com/knighthacks" target="_blank" rel="noopener noreferrer" icon={LaptopChargingSVG}>Discover more Hackathons!</Button>
        </div>
      </main>

    </div>
  );
}
