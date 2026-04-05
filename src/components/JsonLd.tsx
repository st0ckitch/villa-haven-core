import { Helmet } from "react-helmet-async";

interface OrganizationLdProps {
  name?: string;
  url?: string;
  logo?: string;
}

export const OrganizationLd = ({
  name = "Igavi Development",
  url = "",
  logo = "",
}: OrganizationLdProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    ...(url && { url }),
    ...(logo && { logo }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

interface BlogPostingLdProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  url?: string;
}

export const BlogPostingLd = ({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: BlogPostingLdProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: { "@type": "Person", name: author },
    datePublished,
    dateModified,
    ...(image && { image }),
    ...(url && { mainEntityOfPage: url }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

export const BreadcrumbLd = ({ items }: { items: BreadcrumbItem[] }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
