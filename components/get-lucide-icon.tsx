"use client";
import * as lucideIcons from "lucide-react";
import type { FC, SVGProps } from "react";

interface Props {
	name: string;
	className?: string;
}

export const IconComponent = ({ name, className }: Props) => {
	const Icon = Object.entries(lucideIcons)
		.filter(([iconName]) => !iconName.endsWith("Icon"))
		// .slice(200, 600)
		.find(([iconName]) => iconName === name)?.[1] as FC<
		SVGProps<SVGSVGElement>
	>;

	if (!Icon) {
		return null;
	}

	return <Icon className={className} />;
};
