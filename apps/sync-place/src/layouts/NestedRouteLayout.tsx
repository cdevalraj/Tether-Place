import { Link, Outlet, type ValidateLinkOptions } from "@tanstack/react-router";

interface NestedRouteLayout {
	className?: string;
	links: {
		linkOptions: ValidateLinkOptions;
		label: string;
	}[];
}

const NestedRouteLayout = (props: NestedRouteLayout) => {
	return (
		<div className={`main-content ${props.className ?? ""}`}>
			<div className="container">
				<div className="nav-links">
					{props.links.map((link) => {
						return (
							<Link
								className="nav-link"
								key={link.label}
								to={link.linkOptions.to}
							>
								{link.label}
							</Link>
						);
					})}
				</div>
				<div className="form-content">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default NestedRouteLayout;
