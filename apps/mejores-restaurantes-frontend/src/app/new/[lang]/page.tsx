type PageProps = {
	params: Promise<{
		lang: string;
		slug: string;
	}>;
};

export default async function Page({ params }: PageProps) {
	const { lang } = await params;

	return (
		<div className='container mx-auto p-4 mt-40'>
			<h1>Language: {lang}</h1>
		</div>
	);
}
