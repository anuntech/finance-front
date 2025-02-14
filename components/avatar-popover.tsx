import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil } from "lucide-react";
import * as lucideIcons from "lucide-react"; // Import All Lucide Icons
import type React from "react";
import {
	type Dispatch,
	type FC,
	type SVGProps,
	type SetStateAction,
	useMemo,
	useState,
} from "react";
import { Input } from "./ui/input";

type IconEntry = [string, FC<SVGProps<SVGSVGElement>>];
type IconType = FC<SVGProps<SVGSVGElement>>;

interface IconButtonProps {
	iconEntries: Array<IconEntry>;
	onAvatarChange: (avatar: string) => void;
}

const IconButton = ({ iconEntries, onAvatarChange }: IconButtonProps) => {
	return iconEntries.map(([iconName, Icon]) => {
		const IconComponent = Icon as IconType;

		return (
			<button
				key={iconName}
				type="button"
				onClick={() => onAvatarChange(iconName)}
				className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-gray-100"
				title={iconName}
			>
				<IconComponent className="h-6 w-6 text-gray-700" />
			</button>
		);
	});
};

interface LucidePickerProps {
	onAvatarChange: (avatar: string) => void;
}

const LucidePicker = ({ onAvatarChange }: LucidePickerProps) => {
	const [searchFilter, setSearchFilter] = useState("");

	const iconEntries = useMemo(() => {
		return Object.entries(lucideIcons)
			.filter(([iconName]) => !iconName.endsWith("Icon"))
			.slice(200, 600);
	}, []);

	const filteredIcons = useMemo(() => {
		const filterLower = searchFilter.trim().toLowerCase();
		if (!filterLower) {
			return iconEntries;
		}

		return iconEntries.filter(([iconName]) =>
			iconName.toLowerCase().includes(filterLower)
		);
	}, [searchFilter, iconEntries]) as Array<IconEntry>;

	return (
		<div className="flex w-full flex-col gap-4">
			<div className="relative flex items-center">
				<Input
					onChange={e => setSearchFilter(e.target.value)}
					className="pl-10"
					placeholder="Procurar"
				/>
				<lucideIcons.Search className="absolute ml-3" size={15} />
			</div>

			<div className="scrollbar-custom grid max-h-52 grid-cols-7 gap-3 overflow-auto pt-4">
				<IconButton
					iconEntries={filteredIcons}
					onAvatarChange={onAvatarChange}
				/>
			</div>
		</div>
	);
};

interface AvatarPopoverProps {
	onAvatarChange: (avatar: string) => void;
	setFocused: Dispatch<SetStateAction<boolean>>;
}

export const AvatarPopover = ({
	onAvatarChange,
	setFocused,
}: AvatarPopoverProps) => {
	const [open, setOpen] = useState(false);

	const handleSaveLucide = (icon: string) => {
		onAvatarChange(icon);
		setOpen(false);
	};

	const handleSetOpen = () => {
		setOpen(!open);
	};

	return (
		<Popover modal={true} open={open} onOpenChange={handleSetOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className={
						"h-10 w-10 rounded-[50%] bg-white text-black shadow-lg transition-all duration-300 hover:bg-gray-100 focus:bg-gray-100"
					}
					title="Editar avatar"
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
				>
					<Pencil className="h-5 w-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
				<div className="grid gap-6">
					<div className="space-y-4">
						<h4 className="font-semibold text-gray-800 text-lg">
							Escolha um avatar
						</h4>
						<LucidePicker onAvatarChange={handleSaveLucide} />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
