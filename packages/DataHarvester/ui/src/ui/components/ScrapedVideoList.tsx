import { useHarvesterStore } from "../../stores/useHarvesterStore";
import { Video } from "@zeruel/harvester-types";

const ScrapedVideoCard = ({ video }: { video: Video }) => {
    return (
        <div className="flex items-center p-3 bg-gray-800 rounded-lg shadow-md gap-4">
            <img src={video.thumbnail_url} alt={`Thumbnail for video ${video.video_id}`} className="w-16 h-20 object-cover rounded-md" />
            <div className="flex-grow">
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <p className="text-sm text-blue-400 truncate">{`Video ID: ${video.video_id}`}</p>
                </a>
                <p className="text-xs text-gray-400">{`@${video.author_username}`}</p>
                <p className="text-xs text-gray-500">{`${video.stats.comment_count} comments | ${video.stats.likes_count} likes`}</p>
            </div>
        </div>
    )
}


export const ScrapedVideoList = () => {
    const scrapedVideos = useHarvesterStore((state: any) => state.scrapedVideos);

    return (
        <div className="w-full mt-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Recently Scraped (New Videos)</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
                {scrapedVideos.length === 0 && (
                    <p className="text-sm text-gray-500">Waiting for new videos...</p>
                )}
                {scrapedVideos.map((video: Video) => (
                    <ScrapedVideoCard key={video.video_id} video={video} />
                ))}
            </div>
        </div>
    );
}; 