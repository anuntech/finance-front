import Link from "next/link";

const ConfigPage = () => {
	return (
		<>
			<h1 className="font-bold text-2xl">Configurações</h1>
			<hr />
			<Link href="/config/accounts">Contas</Link>
		</>
	);
};

export default ConfigPage;
