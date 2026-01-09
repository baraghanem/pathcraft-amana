'use client';

import ImprovedCreatePathPage from "../../create-path/page";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export default function EditPathPage() {
    const { id } = useParams();
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (id) {
            api.getPath(id as string).then((res: any) => {
                if (res.success) setInitialData(res.data.path);
            });
        }
    }, [id]);

    if (!initialData) return <div className="p-10 text-center">Loading Path Data...</div>;

    // We reuse your CreatePath component but pass the existing data
    return <ImprovedCreatePathPage editMode={true} initialData={initialData} />;
}