import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gift, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MediaUpload from '@/components/media/MediaUpload';
import { useGiveaway } from '@/hooks/useGiveaway';
import { giveawaySchema } from '@/utils/validation';
import { CreateGiveawayRequest } from '@/types/giveaway';

interface GiveawayFormData {
  title: string;
  mainBody: string;
  winnerCount: number;
}

interface GiveawayFormProps {
  onSuccess?: () => void;
}

const GiveawayForm: React.FC<GiveawayFormProps> = ({ onSuccess }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const { createGiveaway, loading, error, clearError } = useGiveaway();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GiveawayFormData>({
    resolver: zodResolver(giveawaySchema),
    defaultValues: {
      winnerCount: 1,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: GiveawayFormData) => {
    clearError();

    const giveawayData: CreateGiveawayRequest = {
      title: data.title,
      mainBody: data.mainBody,
      winnerCount: data.winnerCount,
      mediaFile: mediaFile || undefined,
    };

    try {
      const result = await createGiveaway(giveawayData);
      
      if (result.type === 'giveaway/create/fulfilled') {
        reset();
        setMediaFile(null);
        onSuccess?.();
      }
    } catch (err) {
      console.error('Error creating giveaway:', err);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="mr-2 h-5 w-5" />
          Create New Giveaway
        </CardTitle>
        <CardDescription>
          Fill in the details below to create and publish a new giveaway
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Giveaway Title (Admin Only)
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter giveaway title (visible only to admins)"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
              data-testid="title-input"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
            <p className="text-xs text-gray-500">
              This title is for administrative purposes only and won't be shown to participants
            </p>
          </div>

          {/* Main Body Field */}
          <div className="space-y-2">
            <Label htmlFor="mainBody">
              Main Body Message
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="mainBody"
              placeholder="Enter the main giveaway message that participants will see..."
              rows={6}
              {...register('mainBody')}
              className={errors.mainBody ? 'border-red-500' : ''}
              data-testid="main-body-input"
            />
            {errors.mainBody && (
              <p className="text-sm text-red-500">{errors.mainBody.message}</p>
            )}
            <p className="text-xs text-gray-500">
              This message will be displayed to all participants when they join the giveaway
            </p>
          </div>

          {/* Winner Count Field */}
          <div className="space-y-2">
            <Label htmlFor="winnerCount">
              Number of Winners
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="winnerCount"
              type="number"
              min="1"
              max="100"
              placeholder="1"
              {...register('winnerCount', { valueAsNumber: true })}
              className={errors.winnerCount ? 'border-red-500' : ''}
              data-testid="winner-count-input"
            />
            {errors.winnerCount && (
              <p className="text-sm text-red-500">{errors.winnerCount.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Specify how many winners will be selected (1-100)
            </p>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media Upload (Optional)</Label>
            <MediaUpload
              onFileSelect={setMediaFile}
              selectedFile={mediaFile}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Upload an image or video to make your giveaway more engaging
            </p>
          </div>

          {/* Preview Section */}
          {(watchedValues.mainBody || mediaFile) && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">
                  How participants will see this giveaway:
                </h4>
                <div className="bg-white rounded border p-3">
                  {watchedValues.mainBody && (
                    <p className="text-sm whitespace-pre-wrap mb-3">
                      {watchedValues.mainBody}
                    </p>
                  )}
                  {mediaFile && (
                    <div className="text-xs text-gray-500 italic">
                      📎 {mediaFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="publish-button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Publishing Giveaway...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publish Giveaway
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GiveawayForm;

