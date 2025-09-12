import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { useState } from "react";

export const Home = () => {
	const [calendarView, setCalendarView] = useState('semana');
	return (
		<div className="w-full">
			<header className="border-b border-b-[#DADCE0]">
				<div className="p-4 text-[30px] flex items-center gap-4 justify-between">
					<div className="font-medium text-[#141736] flex items-center gap-4">
						<Button variant="outline" className="text-[#141736] border-[#141736] p-4">
							HOJE
						</Button>
						<p>Janeiro de 2025</p>
						<div>
						<Button variant="ghost" className="text-[#141736] p-4">
							&lt;
						</Button>
						<Button variant="ghost" className="text-[#141736] p-4">
							&gt;
						</Button>
						</div>
					</div>
					<Select defaultValue="semana" onValueChange={setCalendarView}>
						<SelectTrigger className="w-[180px] text-[#141736] border-[#141736] [&_svg]:text-[#141736] cursor-pointer !h-[48px]">
						<SelectValue placeholder="Theme" />
						</SelectTrigger>
					<SelectContent className="cursor-pointer">
						<SelectItem value="semana">Semana</SelectItem>
						<SelectItem value="dia">Dia</SelectItem>
						<SelectItem value="mes">Mês</SelectItem>
					</SelectContent>
				</Select>
				</div>
			</header>
			{ calendarView === 'semana' &&
				<WeeklyCalendar events={[]} />
			}
		</div>
	);
};
