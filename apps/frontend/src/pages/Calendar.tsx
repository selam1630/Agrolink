import { useState, useEffect } from "react";
import { toEthiopian, toGregorian } from "ethiopian-calendar-new";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
const monthsAmharic = [
  "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት",
  "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

const daysAmharic = [
  "እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"
];
const ethiopianPublicHolidays = [
  { month: 1, day: 1, name: "እንቁጣጣሽ (Ethiopian New Year)" },
  { month: 1, day: 17, name: "መስቀል (Finding of the True Cross)" },
  { month: 3, day: 10, name: "የኢድ አል ፈጥር በዓል (Eid al-Fitr)" },
  { month: 3, day: 17, name: "የኢድ አል አድሃ በዓል (Eid al-Adha)" },
  { month: 4, day: 7, name: "የገና በዓል (Christmas)" },
  { month: 5, day: 11, name: "ጥምቀት (Epiphany)" },
  { month: 7, day: 2, name: "የአድዋ ድል ቀን (Adwa Victory Day)" },
  { month: 7, day: 20, name: "የፋሲካ በዓል (Ethiopian Easter)" },
  { month: 9, day: 1, name: "የሰራተኞች ቀን (Labour Day)" },
  { month: 9, day: 12, name: "የወራት መጀመሪያ (Ethiopian Patriots' Victory Day)" },
  { month: 10, day: 6, name: "የኢትዮጵያ አብዮት ቀን (Ethiopian Revolution Day)" },
];

const Calendar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentEthDate, setCurrentEthDate] = useState({ day: 0, month: 0, year: 0 });
  const [displayMonth, setDisplayMonth] = useState(0);
  const [displayYear, setDisplayYear] = useState(0);
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const eth = toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
      setCurrentEthDate(eth);
      if (!displayMonth) {
        setDisplayMonth(eth.month);
        setDisplayYear(eth.year);
      }
    };
    const timerId = setInterval(updateDateTime, 1000);
    updateDateTime();
    return () => clearInterval(timerId);
  }, [displayMonth]);
  const getDaysInEthMonth = (year: number, month: number): number => (month === 13 ? (year % 4 === 3 ? 6 : 5) : 30);
  const changeMonth = (direction: number) => {
    let newMonth = displayMonth + direction;
    let newYear = displayYear;

    if (newMonth > 13) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 13;
      newYear -= 1;
    }

    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
  };
  const renderMonthDays = () => {
    const days = [];
    const totalDays = getDaysInEthMonth(displayYear, displayMonth);
    const gregFirst = toGregorian(displayYear, displayMonth, 1);
    const firstDate = new Date(gregFirst.year, gregFirst.month - 1, gregFirst.day);
    const firstDayOfWeek = firstDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-start-${i}`} className="p-2"></div>);
    }
    for (let i = 1; i <= totalDays; i++) {
      const isCurrentDay = i === currentEthDate.day &&
        displayMonth === currentEthDate.month &&
        displayYear === currentEthDate.year;
      const isHoliday = ethiopianPublicHolidays.some(
        (h) => h.month === displayMonth && h.day === i
      );
      let dayClass = "bg-white text-gray-800 border-gray-200 hover:bg-gray-50";
      if (isCurrentDay) {
        dayClass = "bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white font-bold border-blue-700 shadow-lg scale-105";
      } else if (isHoliday) {
        dayClass = "bg-yellow-100 text-yellow-800 font-semibold border-yellow-200 hover:bg-yellow-200";
      }
      const holidayName = isHoliday ?
        ethiopianPublicHolidays.find(h => h.month === displayMonth && h.day === i)?.name : '';
      days.push(
        <div
          key={i}
          className={`relative flex flex-col items-center justify-center p-2 text-center rounded-lg border transform transition-all duration-300 hover:scale-105 ${dayClass}`}
          title={holidayName}
        >
          <span className="text-xl">{i}</span>
          {isHoliday && <span className="absolute bottom-1 right-1 text-xs text-yellow-500">🎉</span>}
          {isCurrentDay && (
            <span className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full"></span>
          )}
        </div>
      );
    }

    return days;
  };
  const renderHolidays = () => {
    const monthHolidays = ethiopianPublicHolidays.filter(h => h.month === displayMonth);
    return monthHolidays.length > 0 ? (
      <ScrollArea className="h-40 w-full">
        <ul className="space-y-3">
          {monthHolidays.map((holiday, index) => (
            <li key={index} className="flex items-center text-base text-gray-700 p-2 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100">
              <span className="mr-3 text-2xl text-yellow-500">🎉</span>
              <span>
                <strong className="text-green-700">{holiday.day} {monthsAmharic[holiday.month - 1]}</strong> - {holiday.name}
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    ) : (
      <p className="text-gray-600">ለዚህ ወር ምንም በዓላት የሉም (No holidays this month)</p>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto mt-8 p-6">
      <Card className="flex-1 bg-white bg-opacity-90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">
            {currentTime.toLocaleTimeString('en-US', {
              timeZone: 'Africa/Addis_Ababa',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-black text-green-700 mb-6">
            {daysAmharic[currentTime.getDay()]}
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Card className="flex-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <p className="text-green-800 text-lg">ኢትዮጵያዊ የቀን መቁጠሪያ</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {currentEthDate.day} {monthsAmharic[currentEthDate.month - 1]} {currentEthDate.year}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-6">
                <p className="text-gray-600 text-lg">Gregorian Calendar</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {currentTime.getDate()} {currentTime.toLocaleDateString("en-US", { month: "long" })} {currentTime.getFullYear()}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 bg-white bg-opacity-90 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" onClick={() => changeMonth(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <CardTitle className="text-3xl font-extrabold text-green-800 text-center">
            {monthsAmharic[displayMonth - 1]} {displayYear}
          </CardTitle>
          <Button variant="ghost" onClick={() => changeMonth(1)}>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {daysAmharic.map((day, index) => (
              <div key={index} className="text-center font-extrabold text-sm text-gray-500 uppercase">
                {day.slice(0, 2)}
              </div>
            ))}
            {renderMonthDays()}
          </div>
          <div className="mt-auto pt-6 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-green-800 mb-4">የኢትዮጵያ በዓላት (Holidays)</h3>
            {renderHolidays()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
