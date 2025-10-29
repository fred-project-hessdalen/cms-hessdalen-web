import React, { useEffect, useState } from "react";
import { useFormValue } from "sanity";
import { useClient } from "sanity";
import { Card, Stack, Text } from "@sanity/ui";

const ForumPostResponsesPreview = () => {
    const postId = useFormValue(["_id"]);
    const client = useClient({ apiVersion: "2023-10-28" });
    type ResponseType = {
        _id: string;
        title?: string;
        createdAt?: string;
        author?: { name?: string };
    };
    const [responses, setResponses] = useState<ResponseType[]>([]);

    useEffect(() => {
        if (!postId) return;
        client.fetch(
            `*[_type == "forumPostResponse" && parentPost._ref == $postId]{
        _id, title, createdAt, author->{name}
      } | order(createdAt desc)`,
            { postId }
        ).then(setResponses);
    }, [postId, client]);

    if (!postId) return <Text muted>No post ID</Text>;
    if (!responses.length) return <Text muted>No responses yet</Text>;

    return (
        <Stack space={3}>
            {responses.map((r) => (
                <Card key={r._id} padding={3} radius={2} shadow={1} tone="default">
                    <Text size={1} muted>
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "No date"} — {r.author?.name || "Unknown author"}
                    </Text>

                    <div style={{ marginTop: '0.75em' }}>
                        <Text size={2} weight="semibold">{r.title || "Untitled"}</Text>
                    </div>
                </Card>
            ))}
        </Stack>
    );
};
export default ForumPostResponsesPreview;
