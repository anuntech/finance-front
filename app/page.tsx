import Link from "next/link";

export default function Page() {
	return (
		<>
			<h1 className="font-bold text-2xl">Hello World</h1>
			<Link href="/config">Configurações</Link>
		</>
	);
}
