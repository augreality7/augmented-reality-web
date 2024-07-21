export default function PageLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div className="mx-8 lg:mx-0">
            {children}
        </div>
    )
}
