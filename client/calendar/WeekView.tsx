import React from 'react';

const imgBell = "https://www.figma.com/api/mcp/asset/a4e98e68-fe36-4e4c-a48e-dc610cbec373";
const imgWavingHand = "https://www.figma.com/api/mcp/asset/06813045-0945-44f8-bc68-ee9018bb05a9";
const imgSearch = "https://www.figma.com/api/mcp/asset/4cb6dfdd-eddf-4be7-bdb3-e224ea1db92a";
const imgBars = "https://www.figma.com/api/mcp/asset/25470022-df29-40ee-aa39-873406e2c110";
const imgPlusCircle = "https://www.figma.com/api/mcp/asset/169489b7-9aa7-48e7-ba33-88e0e4209b23";

function Bell({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Bell" data-node-id="206:1420">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgBell} />
    </div>
  );
}

type SlotProps = {
  className?: string;
  type?: "blank";
  weekend?: boolean;
  quantity?: "none";
  monthView?: "false";
};

function Slot({ className, type = "blank", weekend = false, quantity = "none", monthView = "false" }: SlotProps) {
  return <div 
    id={
        type === "blank" && !weekend && quantity === "none" && monthView === "false" 
          ? "node-206_1803" 
          : type === "blank" && weekend && quantity === "none" && monthView === "false" 
            ? "node-206_1804" 
            : ""
    } 
    className={className} />;
}

type ColumnProps = {
  className?: string;
  weekend?: boolean;
  type?: "Generic";
  today?: "Default";
};

function Column({ className, weekend = false, type = "Generic", today = "Default" }: ColumnProps) {
  const isNotWeekendAndGenericAndDefault = !weekend && type === "Generic" && today === "Default";
  const isWeekendAndGenericAndDefault = weekend && type === "Generic" && today === "Default";


  const style = "border border-[#dadce0] border-solid flex-[1_0_0] min-h-px min-w-px shrink-0 w-full";
  const slots = [];
  for ( let i = 0; i < 24; i++ ) {
    slots.push(
      <Slot className={ style + " bg-white" } />
    );
  }
  const weekendSlots = [];
  for ( let j = 0; j < 24; j++ ) {
    weekendSlots.push(
      <Slot className={ style + " bg-[#f2f2f2]" } weekend={true} />
    );
  }

  return (
    <div id={isNotWeekendAndGenericAndDefault ? "node-206_1843" : isWeekendAndGenericAndDefault ? "node-206_1868" : ""} className={className}>
      {isNotWeekendAndGenericAndDefault && (
        <>
          {slots}
        </>
      )}
      {isWeekendAndGenericAndDefault && (
        <>
          {weekendSlots}
        </>
      )}
    </div>
  );
}

function WavingHand({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Waving Hand" data-node-id="206:1378">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgWavingHand} />
    </div>
  );
}

type LabelTypeProps = {
  className?: string;
  side?: boolean;
  top?: "true";
  time?: number;
  day?: boolean;
};

function LabelType({ className, side = true, top = "true", time, day = false }: LabelTypeProps) {
  return (
    <div data-node-id="206:1385" className={className}>
      <div data-node-id="206:1386" className="content-stretch flex h-[14px] items-start relative shrink-0" data-name="Typography">
        <p data-node-id="I206:1386;2:85492" className={`font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px]`}>
          {`${time}:00`}
        </p>
      </div>
    </div>
  );
}

type LabelLeftGroupProps = {
  className?: string;
  property1?: "Default";
};



function LabelLeftGroup({ className, property1 = "Default" }: LabelLeftGroupProps) {
  const labels = [];
  for ( let h = 0; h < 24; h++ ) {
    labels.push(<LabelType className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px px-[10px] py-0 relative shrink-0" time={h} />);
  }

  return (
    <div data-node-id="206:1894" className={className}>
      {labels}
    </div>
  );
}

type GridProps = {
  className?: string;
  fit?: "Cropped";
  type?: "Week";
  mobile?: "false";
};

function Grid({ className, fit = "Cropped", type = "Week", mobile = "false" }: GridProps) {
  return (
    <div data-node-id="206:1951" className={className}>
      <LabelLeftGroup className="content-stretch flex flex-col h-full items-start relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" weekend={true} />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" weekend={true} />
    </div>
  );
}

type SearchProps = {
  className?: string;
  property1?: "Default" | "enter search" | "string";
};

function Search({ className, property1 = "Default" }: SearchProps) {
  return (
    <button data-node-id="206:1291" className={className}>
      <div data-node-id="206:1292" className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon/Font Awesome Free/Solid/S/search">
        <div data-node-id="I206:1292;7:707" className="absolute inset-[8.33%_8.34%]" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(106, 119, 139, 1)" } as React.CSSProperties}>
            <img className="block max-w-none size-full" alt="" src={imgSearch} />
          </div>
        </div>
      </div>
    </button>
  );
}

const weekDays: { id: number, label: string }[] = [ 
   { id: 2, label: "Mon" },
   { id: 3, label: "Tue" },
   { id: 4, label: "Wed" },
   { id: 5, label: "Thur" },
   { id: 6, label: "Fri" },
   { id: 7, label: "Sat" },
   { id: 8, label: "Sun" },
]

type EventProps = {
  className: string;
};

function Event( {className}: EventProps ) {
  return (
    <div className={className} data-name="Event" data-node-id="207:2703">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="name time container" data-node-id="I207:2703;21:154376">
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="name container" data-node-id="I207:2703;21:154377">
          <Bell className="relative shrink-0 size-[10px]" />
          <div className="content-stretch flex items-start relative shrink-0" data-name="name" data-node-id="I207:2703;21:154379">
            <div className="flex flex-col font-['Poppins:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap" data-node-id="I207:2703;21:154379;2:85526">
              <p className="leading-[normal]">Event Name</p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-start relative shrink-0" data-name="time" data-node-id="I207:2703;21:154380">
          <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap" data-node-id="I207:2703;21:154380;2:85524">
            <p className="leading-[normal]">08:00 - 12:00 AM</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-start relative shrink-0" data-name="description" data-node-id="I207:2703;21:154381">
        <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap" data-node-id="I207:2703;21:154381;2:85524">
          <p className="leading-[normal]">Description</p>
        </div>
      </div>
    </div>
  )
}

export default function WeekView() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pl-px pr-0 py-0 relative size-full" data-name="WeekView" data-node-id="206:1986">
      <div className="bg-white border-[rgba(218,220,224,0.6)] border-b border-l-0 border-r-0 border-solid border-t content-stretch flex items-center justify-between relative shrink-0 w-full p-2" data-name="Title" data-node-id="206:1987">
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Left Content" data-node-id="I206:1987;1:785">
          <div className="content-stretch flex items-start relative shrink-0" data-name="sidebar toggle" data-node-id="I206:1987;1:786">
            <div className="bg-white content-stretch flex items-center justify-center p-[8px] relative rounded-[999px] shrink-0 size-[35px]" data-name="Button" data-node-id="I206:1987;1:786;1:43894">
              <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon/Font Awesome Free/Solid/B/bars" data-node-id="I206:1987;1:786;1:43894;17:1821">
                <div className="absolute inset-[13.54%_8.33%]" data-name="Vector" data-node-id="I206:1987;1:786;1:43894;17:1821;7:2011">
                  <div className="absolute inset-0" style={{ "--fill-0": "rgba(51, 51, 51, 1)" } as React.CSSProperties}>
                    <img alt="" className="block max-w-none size-full" src={imgBars} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-name="Typography" data-node-id="I206:1987;1:787">
            <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[20px] whitespace-nowrap font-semibold" data-node-id="I206:1987;1:787;2:85504">
              <p className="leading-[normal]">
                <span>{`01-07 November `}</span>
                <span className="font-['Inter:Regular',sans-serif] not-italic">2025</span>
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Right content" data-node-id="I206:1987;1:788">
          {/* <Search className="bg-[#f5f5f5] content-stretch cursor-pointer flex items-center justify-between p-[8px] relative rounded-[999px] shrink-0 size-[32px]" /> */}
          <div className="bg-[#0c41ff] content-stretch flex gap-[4px] h-[35px] items-center justify-center p-[8px] relative rounded-[3px] shrink-0" data-name="Calendar Buttons" data-node-id="I206:1987;1:790">
            <div className="content-stretch flex items-start relative shrink-0" data-node-id="I206:1987;1:790;2:85398">
              <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap" data-node-id="I206:1987;1:790;2:85398;2:85492">
                <p className="leading-[normal]">Add event</p>
              </div>
            </div>
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon/Font Awesome Free/Solid/P/plus-circle" data-node-id="I206:1987;1:790;2:85399">
              <div className="absolute inset-[8.33%]" data-name="Vector" data-node-id="I206:1987;1:790;2:85399;7:851">
                <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                  <img alt="" className="block max-w-none size-full" src={imgPlusCircle} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#dadce0] border-b border-l-0 border-r-0 border-solid border-t-0 content-stretch flex items-start relative shrink-0 w-[436px]" data-name="Weekday" data-node-id="206:1988">
        <div className="bg-white h-[20px] shrink-0 w-[50px]" data-node-id="I206:1988;1:1368" />
        {
          weekDays.map( weekDay => (
            <div key = {weekDay.id} className="content-stretch flex flex-[1_0_0] h-[24px] items-center justify-center min-h-px min-w-px py-0 relative shrink-0" data-node-id="I206:1988;1:1369">
              <div className="content-stretch flex items-start relative shrink-0" data-name="Typography" data-node-id="I206:1988;1:1369;1:1338">
                <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[12px] whitespace-nowrap" data-node-id="I206:1988;1:1369;1:1338;2:85492">
                  <p className="leading-[normal]">{weekDay.label}</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <div className="flex-[1_0_0] min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0 w-full" data-name="CalendarGrid" data-node-id="206:1989">
        <Grid className="absolute content-stretch flex h-[1942px] items-start left-0 right-0 top-0" />
        <Event className="absolute bg-[#55d28f] border border-[#3ba86e] border-solid content-stretch flex flex-col gap-[4px] h-[243px] items-start p-[4px] rounded-[3px] w-[55px]"/>
      </div>
    </div>
  );
}