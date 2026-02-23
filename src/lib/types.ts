export type CommentNode = {
	id: string;
	content: string;
	authorName: string;
	authorId: string;
	createdAt: string;
	children: CommentNode[];
};

export type TopicSummary = {
	id: string;
	title: string;
	type: string;
	status: string;
	description: string | null;
	createdAt: string;
	voteCount: number;
	commentCount: number;
};

export type VoteCounts = {
	yes: number;
	no: number;
	abstain: number;
	total: number;
};
