import { ChevronDown, ChevronUp } from "lucide-react";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";

interface Props {
	count: number;
	setCount: Dispatch<SetStateAction<number>>;
	min: number;
}

export const Counter = ({ count, setCount, min }: Props) => {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => count > min && setCount(count - 1)}
				disabled={count === min}
			>
				<ChevronDown />
			</Button>
			<span className="text-muted-foreground text-sm">{count}</span>
			<Button variant="ghost" size="icon" onClick={() => setCount(count + 1)}>
				<ChevronUp />
			</Button>
		</div>
	);
};
