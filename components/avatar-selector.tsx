"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { AvatarPopover } from "./avatar-popover";
import { IconComponent } from "./get-lucide-icon";

interface AvatarSelectorProps {
	data?: string;
	className?: string;
	onAvatarChange: (avatar: string) => void;
	width?: number;
	height?: number;
}

export const AvatarSelector = ({
	data,
	className,
	onAvatarChange,
	width = 20,
	height = 20,
}: AvatarSelectorProps) => {
	const [focused, setFocused] = useState(false);

	const iconWidth = width ? width / 2 : 10;
	const iconHeight = height ? height / 2 : 10;

	const handleAvatarChange = (newAvatar: string) => {
		onAvatarChange(newAvatar);
	};

	return (
		<div
			className={cn(
				// biome-ignore lint/nursery/useSortedClasses: <explanation>
				`flex h-full w-${width} h-${height} items-center`,
				className
			)}
		>
			<div className="group relative flex h-full w-full items-center justify-center">
				<div className="flex h-full w-full items-center justify-center">
					<IconComponent name={data} className="size-[7rem]" />
				</div>
				<div
					className={`absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 ${(focused || !data) && "opacity-100"}`}
				>
					<AvatarPopover
						onAvatarChange={handleAvatarChange}
						setFocused={setFocused}
						width={iconWidth}
						height={iconHeight}
					/>
				</div>
			</div>
		</div>
	);
};
